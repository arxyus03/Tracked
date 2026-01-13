<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$subject_code = $_GET['subject_code'] ?? '';
$section = $_GET['section'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';
$student_id = $_GET['student_id'] ?? '';

if (!$subject_code || !$section || !$professor_ID || !$student_id) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

try {
    // Verify student is enrolled in the class
    $enrollmentStmt = $pdo->prepare("
        SELECT COUNT(*) as is_enrolled 
        FROM student_classes 
        WHERE subject_code = ? AND student_ID = ? AND archived = 0
    ");
    $enrollmentStmt->execute([$subject_code, $student_id]);
    $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$enrollment || $enrollment['is_enrolled'] == 0) {
        echo json_encode(["success" => false, "message" => "Student not enrolled in this class"]);
        exit;
    }

    // Get class info
    $classStmt = $pdo->prepare("
        SELECT c.*, CONCAT(p.tracked_firstname, ' ', p.tracked_lastname) as professor_name
        FROM classes c
        LEFT JOIN tracked_users p ON c.professor_ID = p.tracked_ID
        WHERE c.subject_code = ? AND c.section = ? AND c.professor_ID = ?
    ");
    $classStmt->execute([$subject_code, $section, $professor_ID]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);

    if (!$classInfo) {
        echo json_encode(["success" => false, "message" => "Class not found"]);
        exit;
    }

    // 1. OUTPUTS DATA for specific student
    $outputsSql = "
    SELECT 
        a.activity_type as activityType,
        COUNT(DISTINCT a.id) AS assignedWorks,
        COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID = ? 
            THEN a.id ELSE NULL END) AS submissions,
        (COUNT(DISTINCT a.id) - COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID = ? 
            THEN a.id ELSE NULL END)) AS missedSubmissions,
        SUM(a.points) AS totalScores,
        SUM(CASE WHEN ag.student_ID = ? THEN COALESCE(ag.grade, 0) ELSE 0 END) AS sumGradedWorks,
        CASE 
            WHEN SUM(a.points) > 0 THEN 
                ROUND((SUM(CASE WHEN ag.student_ID = ? THEN COALESCE(ag.grade, 0) ELSE 0 END) / SUM(a.points)) * 100, 2)
            ELSE 0
        END AS percentage
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND a.activity_type IN ('Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory')
        AND (a.archived = 0 OR a.archived IS NULL)
    GROUP BY a.activity_type
    ";

    $outputsStmt = $pdo->prepare($outputsSql);
    $outputsStmt->execute([$student_id, $student_id, $student_id, $student_id, $subject_code, $professor_ID]);
    $outputsData = $outputsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. EXAMS DATA for specific student
    $examsSql = "
    SELECT 
        a.id,
        a.activity_type,
        a.title,
        a.task_number,
        a.points,
        a.subject_code,
        a.professor_ID,
        ag.grade,
        ag.submitted
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id AND ag.student_ID = ?
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND (a.archived = 0 OR a.archived IS NULL)
        AND (
            a.activity_type LIKE '%Exam%' 
            OR LOWER(a.title) LIKE '%midterm%' 
            OR LOWER(a.title) LIKE '%final%'
            OR LOWER(a.title) LIKE '%written%'
            OR LOWER(a.title) LIKE '%laboratory%'
        )
    ORDER BY a.created_at
    ";

    $examsStmt = $pdo->prepare($examsSql);
    $examsStmt->execute([$student_id, $subject_code, $professor_ID]);
    $examsRaw = $examsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Categorize exams for this student
    $midtermWritten = [];
    $midtermLab = [];
    $finalWritten = [];
    $finalLab = [];

    foreach ($examsRaw as $exam) {
        $title = strtolower($exam['title']);
        
        if (strpos($title, 'midterm') !== false) {
            if (strpos($title, 'laboratory') !== false || strpos($title, 'lab') !== false) {
                $midtermLab[] = $exam;
            } else {
                $midtermWritten[] = $exam;
            }
        } elseif (strpos($title, 'final') !== false) {
            if (strpos($title, 'laboratory') !== false || strpos($title, 'lab') !== false) {
                $finalLab[] = $exam;
            } else {
                $finalWritten[] = $exam;
            }
        } elseif ($exam['activity_type'] == 'Exam') {
            if (strpos($title, 'written') !== false) {
                $midtermWritten[] = $exam;
            } elseif (strpos($title, 'lab') !== false) {
                $midtermLab[] = $exam;
            }
        }
    }

    // Process exam data for this student
    $examsData = [];
    
    if (!empty($midtermWritten)) {
        $examsData[] = processStudentExamData($midtermWritten, 'Midterm Exam - Written Exam');
    }
    
    if (!empty($midtermLab)) {
        $examsData[] = processStudentExamData($midtermLab, 'Midterm Exam - Laboratory Exam');
    }
    
    if (!empty($finalWritten)) {
        $examsData[] = processStudentExamData($finalWritten, 'Final Exam - Written Exam');
    }
    
    if (!empty($finalLab)) {
        $examsData[] = processStudentExamData($finalLab, 'Final Exam - Laboratory Exam');
    }

    // 3. ATTENDANCE DATA for specific student
    $attendanceSql = "
    SELECT 
        COUNT(DISTINCT attendance_date) as totalDays,
        COUNT(*) as totalRecords,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lates,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absents
    FROM attendance
    WHERE subject_code = ? AND professor_ID = ? AND student_ID = ?
    ";

    $attendanceStmt = $pdo->prepare($attendanceSql);
    $attendanceStmt->execute([$subject_code, $professor_ID, $student_id]);
    $attendanceRaw = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

    $attendanceData = [];
    if ($attendanceRaw && $attendanceRaw['totalDays'] > 0) {
        $totalDays = $attendanceRaw['totalDays'];
        $submissions = $attendanceRaw['presents'] + $attendanceRaw['lates'];
        $missedSubmissions = $attendanceRaw['absents'];
        $totalScores = $totalDays * 100; // 100 points per day
        
        // Calculate points: present=100, late=50, absent=0
        $attendancePoints = ($attendanceRaw['presents'] * 100) + ($attendanceRaw['lates'] * 50);
        $sumGradedWorks = $attendancePoints;
        $percentage = $totalScores > 0 ? round(($sumGradedWorks / $totalScores) * 100, 2) : 0;
        
        $attendanceData[] = [
            "activityType" => "Attendance",
            "assignedWorks" => $totalDays,
            "submissions" => $submissions,
            "missedSubmissions" => $missedSubmissions,
            "totalScores" => $totalScores,
            "sumGradedWorks" => $sumGradedWorks,
            "percentage" => $percentage . "%",
            "isAttendance" => true
        ];
    }

    // Combine all data
    $allData = array_merge($outputsData, $examsData, $attendanceData);
    
    // Format data
    foreach ($allData as &$row) {
        // Ensure numeric values are properly typed
        $row['assignedWorks'] = intval($row['assignedWorks'] ?? 0);
        $row['submissions'] = intval($row['submissions'] ?? 0);
        $row['missedSubmissions'] = intval($row['missedSubmissions'] ?? 0);
        $row['totalScores'] = intval($row['totalScores'] ?? 0);
        $row['sumGradedWorks'] = floatval($row['sumGradedWorks'] ?? 0);
        
        // Ensure percentage is a string
        if (isset($row['percentage']) && !strpos($row['percentage'], '%')) {
            $row['percentage'] = round($row['percentage'], 2) . "%";
        }
    }

    // ========== CALCULATE STUDENT SUMMARY USING YOUR EXACT METHOD ==========
    // Get ALL academic activities for this student
    $allAcademicSql = "
    SELECT 
        a.id,
        a.activity_type,
        a.title,
        a.points as totalPossible,
        COALESCE(ag.grade, 0) as actualScore
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id AND ag.student_ID = ?
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND a.activity_type IN ('Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory', 'Exam')
        AND (a.archived = 0 OR a.archived IS NULL)
    ORDER BY a.created_at
    ";

    $allAcademicStmt = $pdo->prepare($allAcademicSql);
    $allAcademicStmt->execute([$student_id, $subject_code, $professor_ID]);
    $allAcademicActivities = $allAcademicStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate academic percentage using YOUR METHOD
    $totalActivities = 0;
    $totalPossibleScores = 0;
    $totalActualScores = 0;
    $academicPercentage = 0;
    
    foreach ($allAcademicActivities as $activity) {
        $totalPossible = $activity['totalPossible'];
        $actualScore = $activity['actualScore'];
        
        if ($totalPossible > 0) {
            // Convert to percentage (like your example: 75/100 = 75%)
            $activityPercentage = ($actualScore / $totalPossible) * 100;
            $totalActualScores += $activityPercentage;
            $totalActivities++;
            $totalPossibleScores += 100; // Each activity contributes 100% possible
        }
    }
    
    // Calculate academic percentage: (sum of all activity percentages) / (number of activities * 100)
    if ($totalPossibleScores > 0) {
        $academicPercentage = ($totalActualScores / $totalPossibleScores) * 100;
    }
    
    // Calculate attendance percentage
    $attendancePercentage = 0;
    if ($attendanceRaw && $attendanceRaw['totalDays'] > 0) {
        $totalDays = $attendanceRaw['totalDays'];
        $attendancePoints = ($attendanceRaw['presents'] * 100) + ($attendanceRaw['lates'] * 50);
        $totalPossibleAttendance = $totalDays * 100;
        $attendancePercentage = $totalPossibleAttendance > 0 
            ? ($attendancePoints / $totalPossibleAttendance) * 100 
            : 0;
    }
    
    // Final weighted percentage (75% academic, 25% attendance) - YOUR EXACT METHOD
    $finalPercentage = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
    
    $studentSummary = [
        "totalAssigned" => $totalActivities,
        "totalSubmissions" => count(array_filter($allAcademicActivities, function($a) { return $a['actualScore'] > 0; })),
        "totalScores" => $totalPossibleScores,
        "totalGradedWorks" => $totalActualScores,
        "academicPercentage" => round($academicPercentage, 2),
        "attendancePercentage" => round($attendancePercentage, 2),
        "finalPercentage" => round($finalPercentage, 2),
        "academicDetails" => [
            "totalActivities" => $totalActivities,
            "totalPossibleScores" => $totalPossibleScores,
            "totalActualScores" => $totalActualScores
        ]
    ];

    echo json_encode([
        "success" => true,
        "student_id" => $student_id,
        "class_info" => $classInfo,
        "data" => $allData,
        "summary" => $studentSummary
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

// Helper function to process student exam data
function processStudentExamData($exams, $label) {
    $assignedWorks = count($exams);
    $submissions = 0;
    $totalScores = 0;
    $sumGradedWorks = 0;
    
    foreach ($exams as $exam) {
        if ($exam['submitted'] == 1) {
            $submissions++;
        }
        $totalScores += $exam['points'];
        $sumGradedWorks += $exam['grade'] ?? 0;
    }
    
    $missedSubmissions = $assignedWorks - $submissions;
    $percentage = $totalScores > 0 ? round(($sumGradedWorks / $totalScores) * 100, 2) : 0;
    
    return [
        "activityType" => $label,
        "assignedWorks" => $assignedWorks,
        "submissions" => $submissions,
        "missedSubmissions" => $missedSubmissions,
        "totalScores" => $totalScores,
        "sumGradedWorks" => $sumGradedWorks,
        "percentage" => $percentage . "%",
        "isExam" => true
    ];
}
?>