<?php
// SubjectAnalyticsProfDB/fetch_student_performance.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

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

// Get parameters
$subjectCode = isset($_GET['code']) ? $_GET['code'] : '';
$studentId = isset($_GET['student_id']) ? $_GET['student_id'] : '';
$studentIds = isset($_GET['student_ids']) ? explode(',', $_GET['student_ids']) : [];
$activityType = isset($_GET['activity_type']) ? $_GET['activity_type'] : 'all';

if (empty($subjectCode)) {
    echo json_encode(['error' => 'Subject code is required']);
    exit;
}

// Map activity types
$activityTypeMap = [
    'assignment' => 'Assignment',
    'quiz' => 'Quiz',
    'activity' => 'Activity',
    'project' => 'Project',
    'laboratory' => 'Laboratory',
    'all' => null
];

$dbActivityType = $activityType !== 'all' ? $activityTypeMap[$activityType] : null;

try {
    // Get the earliest attendance date to determine Week 1
    $attendanceSql = "SELECT MIN(attendance_date) as start_date 
                      FROM attendance 
                      WHERE subject_code = :subject_code";
    $attendanceStmt = $pdo->prepare($attendanceSql);
    $attendanceStmt->execute([':subject_code' => $subjectCode]);
    $attendanceResult = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
    
    $startDate = $attendanceResult['start_date'] ?? date('Y-m-d');
    
    // Calculate week boundaries (assuming 7-day weeks)
    $weekIntervals = [];
    $currentDate = new DateTime($startDate);
    $endDate = new DateTime();
    
    // Get all weeks from start date to now
    $weekNumber = 1;
    while ($currentDate <= $endDate) {
        $weekStart = clone $currentDate;
        $weekEnd = clone $currentDate;
        $weekEnd->modify('+6 days');
        
        $weekIntervals[$weekNumber] = [
            'start' => $weekStart->format('Y-m-d'),
            'end' => $weekEnd->format('Y-m-d')
        ];
        
        $currentDate->modify('+7 days');
        $weekNumber++;
    }
    
    // If no weeks found, create at least one
    if (empty($weekIntervals)) {
        $weekIntervals[1] = [
            'start' => $startDate,
            'end' => date('Y-m-d')
        ];
    }
    
    $responseData = [];
    
    // Determine which students to fetch
    $studentsToFetch = [];
    if (!empty($studentId)) {
        $studentsToFetch = [$studentId];
    } elseif (!empty($studentIds)) {
        $studentsToFetch = $studentIds;
    }
    
    // If no specific students, get all students in class
    if (empty($studentsToFetch)) {
        $allStudentsSql = "SELECT student_ID FROM student_classes 
                          WHERE subject_code = :subject_code AND archived = 0";
        $allStudentsStmt = $pdo->prepare($allStudentsSql);
        $allStudentsStmt->execute([':subject_code' => $subjectCode]);
        $allStudents = $allStudentsStmt->fetchAll(PDO::FETCH_COLUMN);
        $studentsToFetch = $allStudents;
    }
    
    // Fetch student names
    if (!empty($studentsToFetch)) {
        $placeholders = str_repeat('?,', count($studentsToFetch) - 1) . '?';
        $studentNamesSql = "SELECT tracked_ID, CONCAT(tracked_firstname, ' ', tracked_lastname) as studentName 
                           FROM tracked_users 
                           WHERE tracked_ID IN ($placeholders)";
        $studentNamesStmt = $pdo->prepare($studentNamesSql);
        $studentNamesStmt->execute($studentsToFetch);
        $studentNames = $studentNamesStmt->fetchAll(PDO::FETCH_KEY_PAIR);
    } else {
        $studentNames = [];
    }
    
    foreach ($studentsToFetch as $student) {
        $studentData = [
            'studentId' => $student,
            'studentName' => $studentNames[$student] ?? 'Unknown Student',
            'studentNumber' => $student,
            'performanceTrend' => [],
            'attendance' => 0,
            'assignmentCompletion' => 0,
            'performanceType' => 'stable'
        ];
        
        $performanceByWeek = [];
        
        foreach ($weekIntervals as $weekNum => $dates) {
            // Calculate academic percentage for this week
            $academicSql = "SELECT 
                            SUM(CASE 
                                WHEN ag.grade IS NOT NULL AND ag.submitted = 1 
                                THEN ag.grade 
                                ELSE 0 
                            END) as total_actual,
                            COUNT(*) as activity_count,
                            SUM(CASE 
                                WHEN ag.grade IS NOT NULL AND ag.submitted = 1 
                                THEN 100 
                                ELSE 0 
                            END) as total_possible
                        FROM activities a
                        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = :student_id
                        WHERE a.subject_code = :subject_code 
                        AND a.archived = 0
                        AND DATE(a.deadline) BETWEEN :week_start AND :week_end";
            
            // Add activity type filter if not 'all'
            if ($dbActivityType !== null) {
                $academicSql .= " AND a.activity_type = :activity_type";
            }
            
            $academicStmt = $pdo->prepare($academicSql);
            $params = [
                ':student_id' => $student,
                ':subject_code' => $subjectCode,
                ':week_start' => $dates['start'],
                ':week_end' => $dates['end']
            ];
            
            if ($dbActivityType !== null) {
                $params[':activity_type'] = $dbActivityType;
            }
            
            $academicStmt->execute($params);
            $academicResult = $academicStmt->fetch(PDO::FETCH_ASSOC);
            
            $academicPercentage = 0;
            if ($academicResult['total_possible'] > 0) {
                $academicPercentage = ($academicResult['total_actual'] / $academicResult['total_possible']) * 100;
            }
            
            // Calculate attendance percentage for this week
            $attendanceSql = "SELECT 
                                COUNT(*) as total_days,
                                SUM(CASE 
                                    WHEN status = 'present' THEN 100
                                    WHEN status = 'late' THEN 50
                                    ELSE 0
                                END) as total_points
                            FROM attendance
                            WHERE subject_code = :subject_code
                            AND student_ID = :student_id
                            AND attendance_date BETWEEN :week_start AND :week_end";
            
            $attendanceStmt = $pdo->prepare($attendanceSql);
            $attendanceStmt->execute([
                ':subject_code' => $subjectCode,
                ':student_id' => $student,
                ':week_start' => $dates['start'],
                ':week_end' => $dates['end']
            ]);
            $attendanceResult = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
            
            $attendancePercentage = 0;
            if ($attendanceResult['total_days'] > 0) {
                $attendancePercentage = ($attendanceResult['total_points'] / ($attendanceResult['total_days'] * 100)) * 100;
            }
            
            // If filtering by activity type, use academic percentage only (no attendance)
            if ($dbActivityType !== null) {
                $weightedPerformance = $academicPercentage;
            } else {
                // Calculate weighted performance (75% academic, 25% attendance) for all activities
                $weightedPerformance = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
            }
            
            $performanceByWeek[$weekNum] = round($weightedPerformance, 2); // 2 decimal points
        }
        
        // Prepare trend data for the student
        foreach ($performanceByWeek as $week => $score) {
            $studentData['performanceTrend'][] = [
                'week' => $week,
                'score' => $score
            ];
        }
        
        // Calculate overall attendance percentage
        $overallAttendanceSql = "SELECT 
                                COUNT(*) as total_days,
                                SUM(CASE 
                                    WHEN status = 'present' THEN 100
                                    WHEN status = 'late' THEN 50
                                    ELSE 0
                                END) as total_points
                            FROM attendance
                            WHERE subject_code = :subject_code
                            AND student_ID = :student_id";
        
        $overallAttendanceStmt = $pdo->prepare($overallAttendanceSql);
        $overallAttendanceStmt->execute([
            ':subject_code' => $subjectCode,
            ':student_id' => $student
        ]);
        $overallAttendanceResult = $overallAttendanceStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($overallAttendanceResult['total_days'] > 0) {
            $studentData['attendance'] = round(($overallAttendanceResult['total_points'] / ($overallAttendanceResult['total_days'] * 100)) * 100, 0);
        }
        
        // Calculate assignment completion rate
        $completionSql = "SELECT 
                            COUNT(*) as total_activities,
                            SUM(CASE WHEN ag.submitted = 1 THEN 1 ELSE 0 END) as completed
                        FROM activities a
                        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = :student_id
                        WHERE a.subject_code = :subject_code 
                        AND a.archived = 0";
        
        // Add activity type filter if not 'all'
        if ($dbActivityType !== null) {
            $completionSql .= " AND a.activity_type = :activity_type";
        }
        
        $completionStmt = $pdo->prepare($completionSql);
        $completionParams = [
            ':student_id' => $student,
            ':subject_code' => $subjectCode
        ];
        
        if ($dbActivityType !== null) {
            $completionParams[':activity_type'] = $dbActivityType;
        }
        
        $completionStmt->execute($completionParams);
        $completionResult = $completionStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($completionResult['total_activities'] > 0) {
            $studentData['assignmentCompletion'] = round(($completionResult['completed'] / $completionResult['total_activities']) * 100, 0);
        }
        
        // Determine performance type based on trend
        if (count($studentData['performanceTrend']) >= 2) {
            $firstScore = $studentData['performanceTrend'][0]['score'];
            $lastScore = end($studentData['performanceTrend'])['score'];
            
            if ($lastScore - $firstScore > 5) {
                $studentData['performanceType'] = 'improving';
            } elseif ($firstScore - $lastScore > 5) {
                $studentData['performanceType'] = 'declining';
            } elseif ($lastScore >= 85) {
                $studentData['performanceType'] = 'high';
            } elseif ($lastScore <= 70) {
                $studentData['performanceType'] = 'low';
            } else {
                $studentData['performanceType'] = 'stable';
            }
        }
        
        $responseData[] = $studentData;
    }
    
    echo json_encode([
        'success' => true,
        'students' => $responseData,
        'weekIntervals' => $weekIntervals,
        'startDate' => $startDate,
        'activityType' => $activityType
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Query failed: ' . $e->getMessage()]);
}
?>