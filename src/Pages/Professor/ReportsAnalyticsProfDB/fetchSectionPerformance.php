<?php
// Professor/ReportsAnalyticsProfDB/fetchSectionPerformance.php
header('Access-Control-Allow-Origin: https://tracked.6minds.site');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get professor ID from query parameter
$professorID = $_GET['professor_id'] ?? null;

if (!$professorID) {
    echo json_encode(['error' => 'Professor ID is required']);
    exit;
}

// Fetch professor's active classes
$sql = "
    SELECT 
        c.subject_code,
        c.subject,
        c.section,
        c.subject_semester,
        COUNT(DISTINCT sc.student_ID) as student_count
    FROM classes c
    LEFT JOIN student_classes sc ON c.subject_code = sc.subject_code 
        AND sc.archived = 0
    WHERE c.professor_ID = :professorID 
        AND c.status = 'Active'
    GROUP BY c.subject_code, c.section
    ORDER BY c.subject, c.section
";

$stmt = $pdo->prepare($sql);
$stmt->execute([':professorID' => $professorID]);
$classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$response = [];
$sectionColors = [
    '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#8B5CF6', '#F97316', '#84CC16'
];

foreach ($classes as $index => $class) {
    $sectionCode = $class['subject_code'] . '-' . $class['section'];
    $color = $sectionColors[$index % count($sectionColors)];
    
    // Get weekly performance for this section
    $weeklyPerformance = getWeeklyPerformance($pdo, $class['subject_code']);
    
    $response[] = [
        'section' => $class['subject'] . ' - ' . $class['section'],
        'sectionCode' => $sectionCode,
        'color' => $color,
        'studentCount' => (int)$class['student_count'],
        'data' => $weeklyPerformance
    ];
}

echo json_encode($response);

function getWeeklyPerformance($pdo, $subjectCode) {
    // Get all activities for this subject
    $activitySql = "
        SELECT 
            a.id as activity_id,
            a.activity_type,
            a.title,
            a.points as max_points,
            a.deadline,
            DATE(a.deadline) as deadline_date,
            a.created_at,
            WEEK(a.deadline, 1) as week_number,
            YEAR(a.deadline) as year_number
        FROM activities a
        WHERE a.subject_code = :subjectCode 
            AND a.archived = 0
            AND a.deadline IS NOT NULL
        ORDER BY a.deadline
    ";
    
    $activityStmt = $pdo->prepare($activitySql);
    $activityStmt->execute([':subjectCode' => $subjectCode]);
    $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get all students in this class
    $studentSql = "
        SELECT DISTINCT sc.student_ID
        FROM student_classes sc
        WHERE sc.subject_code = :subjectCode 
            AND sc.archived = 0
    ";
    
    $studentStmt = $pdo->prepare($studentSql);
    $studentStmt->execute([':subjectCode' => $subjectCode]);
    $students = $studentStmt->fetchAll(PDO::FETCH_COLUMN, 0);
    
    // Get attendance data
    $attendanceSql = "
        SELECT 
            student_ID,
            attendance_date,
            status,
            WEEK(attendance_date, 1) as week_number,
            YEAR(attendance_date) as year_number
        FROM attendance
        WHERE subject_code = :subjectCode
        ORDER BY attendance_date
    ";
    
    $attendanceStmt = $pdo->prepare($attendanceSql);
    $attendanceStmt->execute([':subjectCode' => $subjectCode]);
    $attendanceRecords = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group activities by week
    $activitiesByWeek = [];
    foreach ($activities as $activity) {
        $weekKey = $activity['year_number'] . '-W' . str_pad($activity['week_number'], 2, '0', STR_PAD_LEFT);
        if (!isset($activitiesByWeek[$weekKey])) {
            $activitiesByWeek[$weekKey] = [
                'week' => count($activitiesByWeek) + 1, // Sequential week number for chart
                'activities' => [],
                'attendance' => []
            ];
        }
        $activitiesByWeek[$weekKey]['activities'][] = $activity;
    }
    
    // Group attendance by week
    foreach ($attendanceRecords as $record) {
        $weekKey = $record['year_number'] . '-W' . str_pad($record['week_number'], 2, '0', STR_PAD_LEFT);
        if (!isset($activitiesByWeek[$weekKey])) {
            $activitiesByWeek[$weekKey] = [
                'week' => count($activitiesByWeek) + 1,
                'activities' => [],
                'attendance' => []
            ];
        }
        $activitiesByWeek[$weekKey]['attendance'][] = $record;
    }
    
    // Calculate weekly performance
    $weeklyData = [];
    foreach ($activitiesByWeek as $weekKey => $weekData) {
        $weekPerformance = calculateWeekPerformance(
            $pdo, 
            $subjectCode, 
            $students, 
            $weekData['activities'], 
            $weekData['attendance']
        );
        
        if ($weekPerformance) {
            $weeklyData[] = [
                'week' => $weekData['week'],
                'score' => round($weekPerformance['overallPercentage'], 2),
                'activities' => count($weekData['activities']),
                'reason' => generatePerformanceReason($weekPerformance),
                'performanceChange' => $weekPerformance['performanceChange'],
                'activityDetails' => $weekPerformance['activityDetails'],
                'studentCount' => count($students),
                'submissionRate' => $weekPerformance['submissionRate']
            ];
        }
    }
    
    // Sort by week number
    usort($weeklyData, function($a, $b) {
        return $a['week'] <=> $b['week'];
    });
    
    return $weeklyData;
}

function calculateWeekPerformance($pdo, $subjectCode, $students, $weekActivities, $weekAttendance) {
    if (empty($weekActivities) && empty($weekAttendance)) {
        return null;
    }
    
    $totalStudents = count($students);
    if ($totalStudents === 0) return null;
    
    $weekOverallTotal = 0;
    $activityDetails = [];
    $totalSubmissions = 0;
    $totalPossibleSubmissions = 0;
    
    // Calculate academic performance from activities
    foreach ($weekActivities as $activity) {
        $activityId = $activity['activity_id'];
        
        // Get grades for this activity
        $gradeSql = "
            SELECT 
                ag.student_ID,
                ag.grade,
                ag.submitted,
                ag.late,
                ag.submitted_at
            FROM activity_grades ag
            WHERE ag.activity_ID = :activityId
        ";
        
        $gradeStmt = $pdo->prepare($gradeSql);
        $gradeStmt->execute([':activityId' => $activityId]);
        $grades = $gradeStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $gradesByStudent = [];
        foreach ($grades as $grade) {
            $gradesByStudent[$grade['student_ID']] = $grade;
        }
        
        $activityTotalScore = 0;
        $activitySubmissions = 0;
        $activityPossibleScore = $totalStudents * 100; // Each student can get max 100%
        
        foreach ($students as $studentId) {
            if (isset($gradesByStudent[$studentId]) && $gradesByStudent[$studentId]['submitted']) {
                $grade = $gradesByStudent[$studentId]['grade'];
                $maxPoints = $activity['max_points'];
                
                // Convert to percentage
                $percentage = ($maxPoints > 0) ? ($grade / $maxPoints) * 100 : 0;
                $activityTotalScore += min($percentage, 100); // Cap at 100%
                $activitySubmissions++;
            }
        }
        
        $activityPercentage = ($activityPossibleScore > 0) ? 
            ($activityTotalScore / $activityPossibleScore) * 100 : 0;
        
        $activityDetails[] = [
            'activityId' => $activityId,
            'title' => $activity['title'],
            'type' => $activity['activity_type'],
            'deadline' => $activity['deadline'],
            'createdAt' => $activity['created_at'],
            'maxPoints' => $activity['max_points'],
            'submissions' => $activitySubmissions,
            'totalStudents' => $totalStudents,
            'percentage' => round($activityPercentage, 2)
        ];
        
        $totalSubmissions += $activitySubmissions;
        $totalPossibleSubmissions += $totalStudents;
        $weekOverallTotal += $activityPercentage;
    }
    
    // Calculate attendance performance
    $attendancePercentage = 0;
    if (!empty($weekAttendance)) {
        $attendanceByStudentDay = [];
        foreach ($weekAttendance as $record) {
            $dayKey = $record['attendance_date'] . '-' . $record['student_ID'];
            $attendanceByStudentDay[$dayKey] = $record['status'];
        }
        
        $attendanceTotalScore = 0;
        $attendancePossibleScore = 0;
        
        // Group by student and count days
        $studentAttendance = [];
        foreach ($weekAttendance as $record) {
            if (!isset($studentAttendance[$record['student_ID']])) {
                $studentAttendance[$record['student_ID']] = [
                    'present' => 0,
                    'late' => 0,
                    'absent' => 0,
                    'total' => 0
                ];
            }
            
            $studentAttendance[$record['student_ID']]['total']++;
            switch ($record['status']) {
                case 'present':
                    $studentAttendance[$record['student_ID']]['present']++;
                    break;
                case 'late':
                    $studentAttendance[$record['student_ID']]['late']++;
                    break;
                case 'absent':
                    $studentAttendance[$record['student_ID']]['absent']++;
                    break;
            }
        }
        
        foreach ($students as $studentId) {
            if (isset($studentAttendance[$studentId])) {
                $studentData = $studentAttendance[$studentId];
                $studentScore = ($studentData['present'] * 100) + 
                               ($studentData['late'] * 50) + 
                               ($studentData['absent'] * 0);
                $maxPossible = $studentData['total'] * 100;
                
                if ($maxPossible > 0) {
                    $attendanceTotalScore += ($studentScore / $maxPossible) * 100;
                }
                $attendancePossibleScore += 100;
            }
        }
        
        if ($attendancePossibleScore > 0) {
            $attendancePercentage = ($attendanceTotalScore / $attendancePossibleScore) * 100;
        }
    }
    
    // Calculate final performance using weights: 75% academic, 25% attendance
    $academicPercentage = (count($weekActivities) > 0) ? 
        ($weekOverallTotal / count($weekActivities)) : 0;
    
    $overallPercentage = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
    
    // Calculate performance change (compared to previous week)
    $performanceChange = 0; // Will be calculated when comparing weeks
    
    return [
        'overallPercentage' => $overallPercentage,
        'academicPercentage' => $academicPercentage,
        'attendancePercentage' => $attendancePercentage,
        'performanceChange' => $performanceChange,
        'activityDetails' => $activityDetails,
        'submissionRate' => ($totalPossibleSubmissions > 0) ? 
            round(($totalSubmissions / $totalPossibleSubmissions) * 100, 2) : 0
    ];
}

function generatePerformanceReason($weekPerformance) {
    $score = $weekPerformance['overallPercentage'];
    
    if ($score < 71) {
        return "Low performance. Consider reviewing teaching methods or providing additional support.";
    } elseif ($score >= 71 && $score <= 75) {
        return "Close to failing. Additional review sessions may help improve scores.";
    } elseif ($score >= 76 && $score <= 79) {
        return "Satisfactory performance with room for improvement.";
    } else {
        return "Good performance. Current teaching strategies are effective.";
    }
}
?>