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

if (!$subject_code || !$section || !$professor_ID) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

try {
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

    // Get enrolled students
    $studentsStmt = $pdo->prepare("
        SELECT student_ID FROM student_classes 
        WHERE subject_code = ? AND archived = 0
    ");
    $studentsStmt->execute([$subject_code]);
    $enrolledStudents = $studentsStmt->fetchAll(PDO::FETCH_COLUMN, 0);
    $studentCount = count($enrolledStudents);

    if ($studentCount == 0) {
        echo json_encode([
            "success" => true,
            "class_info" => $classInfo,
            "data" => [],
            "summary" => []
        ]);
        exit;
    }

    $placeholders = str_repeat('?,', count($enrolledStudents) - 1) . '?';
    
    // 1. OUTPUTS DATA (Assignment, Quiz, Activity, Project, Laboratory)
    $outputsSql = "
    SELECT 
        a.activity_type as activityType,
        COUNT(DISTINCT a.id) AS assignedWorks,
        COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) 
            THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END) AS submissions,
        (COUNT(DISTINCT a.id) * ? - COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) 
            THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END)) AS missedSubmissions,
        SUM(a.points) AS totalScores,
        SUM(COALESCE(ag.grade, 0)) AS sumGradedWorks,
        CASE 
            WHEN SUM(a.points) > 0 THEN 
                ROUND((SUM(COALESCE(ag.grade, 0)) / SUM(a.points)) * 100, 2)
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

    $outputsParams = array_merge(
        $enrolledStudents,
        [$studentCount],
        $enrolledStudents,
        [$subject_code, $professor_ID]
    );

    $outputsStmt = $pdo->prepare($outputsSql);
    $outputsStmt->execute($outputsParams);
    $outputsData = $outputsStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. EXAMS DATA - Analyze activity titles for Midterm and Final exams
    $examsSql = "
    SELECT 
        a.id,
        a.activity_type,
        a.title,
        a.task_number,
        a.points,
        a.subject_code,
        a.professor_ID
    FROM activities a
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
    $examsStmt->execute([$subject_code, $professor_ID]);
    $examsRaw = $examsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Categorize exams
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
            // Default categorization if no specific keywords
            if (strpos($title, 'written') !== false) {
                $midtermWritten[] = $exam;
            } elseif (strpos($title, 'lab') !== false) {
                $midtermLab[] = $exam;
            }
        }
    }

    // Process exam data
    $examsData = [];
    
    // Midterm Written
    if (!empty($midtermWritten)) {
        $examsData[] = processExamData($pdo, $midtermWritten, $enrolledStudents, 'Midterm Exam - Written Exam');
    }
    
    // Midterm Laboratory
    if (!empty($midtermLab)) {
        $examsData[] = processExamData($pdo, $midtermLab, $enrolledStudents, 'Midterm Exam - Laboratory Exam');
    }
    
    // Final Written
    if (!empty($finalWritten)) {
        $examsData[] = processExamData($pdo, $finalWritten, $enrolledStudents, 'Final Exam - Written Exam');
    }
    
    // Final Laboratory
    if (!empty($finalLab)) {
        $examsData[] = processExamData($pdo, $finalLab, $enrolledStudents, 'Final Exam - Laboratory Exam');
    }

    // 3. ATTENDANCE DATA
    $attendanceSql = "
    SELECT 
        COUNT(DISTINCT attendance_date) as totalDays,
        COUNT(*) as totalRecords,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lates,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absents
    FROM attendance
    WHERE subject_code = ? AND professor_ID = ?
    ";

    $attendanceStmt = $pdo->prepare($attendanceSql);
    $attendanceStmt->execute([$subject_code, $professor_ID]);
    $attendanceRaw = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

    $attendanceData = [];
    if ($attendanceRaw && $attendanceRaw['totalDays'] > 0) {
        $totalDays = $attendanceRaw['totalDays'];
        $submissions = $attendanceRaw['presents'] + $attendanceRaw['lates'];
        $missedSubmissions = $attendanceRaw['absents'];
        $totalScores = $totalDays * 100 * $studentCount;
        
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
    
    // Format and ensure proper data types
    foreach ($allData as &$row) {
        // Ensure numeric values are properly typed
        $row['assignedWorks'] = intval($row['assignedWorks'] ?? 0);
        $row['submissions'] = intval($row['submissions'] ?? 0);
        $row['missedSubmissions'] = intval($row['missedSubmissions'] ?? 0);
        $row['totalScores'] = intval($row['totalScores'] ?? 0);
        $row['sumGradedWorks'] = floatval($row['sumGradedWorks'] ?? 0);
        
        // Ensure percentage is a string with % sign
        if (isset($row['percentage']) && !strpos($row['percentage'], '%')) {
            $row['percentage'] = round($row['percentage'], 2) . "%";
        }
    }

    // Calculate overall summary USING YOUR EXACT METHOD
    $summary = calculateOverallSummary($pdo, $subject_code, $professor_ID, $enrolledStudents, $attendanceRaw);

    echo json_encode([
        "success" => true,
        "class_info" => $classInfo,
        "data" => $allData,
        "summary" => $summary
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

// Helper function to process exam data
function processExamData($pdo, $exams, $enrolledStudents, $label) {
    $examIds = array_column($exams, 'id');
    $placeholders = str_repeat('?,', count($enrolledStudents) - 1) . '?';
    $examPlaceholders = str_repeat('?,', count($examIds) - 1) . '?';
    
    $params = array_merge($examIds, $enrolledStudents, $enrolledStudents);
    
    $sql = "
    SELECT 
        COUNT(DISTINCT a.id) AS assignedWorks,
        COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) 
            THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END) AS submissions,
        (COUNT(DISTINCT a.id) * ? - COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) 
            THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END)) AS missedSubmissions,
        SUM(a.points) AS totalScores,
        SUM(COALESCE(ag.grade, 0)) AS sumGradedWorks
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id
    WHERE a.id IN ($examPlaceholders)
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_merge($params, [count($enrolledStudents)], $enrolledStudents));
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $percentage = $result['totalScores'] > 0 
        ? round(($result['sumGradedWorks'] / $result['totalScores']) * 100, 2) 
        : 0;
    
    return [
        "activityType" => $label,
        "assignedWorks" => intval($result['assignedWorks'] ?? 0),
        "submissions" => intval($result['submissions'] ?? 0),
        "missedSubmissions" => intval($result['missedSubmissions'] ?? 0),
        "totalScores" => intval($result['totalScores'] ?? 0),
        "sumGradedWorks" => floatval($result['sumGradedWorks'] ?? 0),
        "percentage" => $percentage . "%",
        "isExam" => true
    ];
}

// Helper function to calculate overall summary USING YOUR EXACT METHOD
function calculateOverallSummary($pdo, $subject_code, $professor_ID, $enrolledStudents, $attendanceRaw) {
    if (empty($enrolledStudents)) {
        return [
            "totalAssigned" => 0,
            "totalSubmissions" => 0,
            "totalScores" => 0,
            "totalGradedWorks" => 0,
            "academicPercentage" => 0,
            "attendancePercentage" => 0,
            "finalPercentage" => 0,
            "academicDetails" => [
                "totalActivities" => 0,
                "totalPossibleScores" => 0,
                "totalActualScores" => 0
            ]
        ];
    }
    
    $placeholders = str_repeat('?,', count($enrolledStudents) - 1) . '?';
    
    // ========== ACADEMIC ACTIVITIES CALCULATION (YOUR METHOD) ==========
    // Get ALL academic activities (Assignments, Quizzes, Activities, Projects, Laboratory, Exams)
    $academicSql = "
    SELECT 
        a.id,
        a.activity_type,
        a.title,
        a.points as totalPossible,
        COALESCE(ag.grade, 0) as actualScore
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND a.activity_type IN ('Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory', 'Exam')
        AND (a.archived = 0 OR a.archived IS NULL)
        AND ag.student_ID IN ($placeholders)
    ORDER BY a.created_at
    ";

    $academicStmt = $pdo->prepare($academicSql);
    $academicStmt->execute(array_merge([$subject_code, $professor_ID], $enrolledStudents));
    $academicActivities = $academicStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate academic percentage using YOUR METHOD
    $totalActivities = 0;
    $totalPossibleScores = 0;
    $totalActualScores = 0;
    $academicPercentage = 0;
    
    // Group by activity to avoid duplicates
    $uniqueActivities = [];
    foreach ($academicActivities as $activity) {
        $activityId = $activity['id'];
        if (!isset($uniqueActivities[$activityId])) {
            $uniqueActivities[$activityId] = [
                'totalPossible' => $activity['totalPossible'],
                'actualScores' => []
            ];
        }
        $uniqueActivities[$activityId]['actualScores'][] = $activity['actualScore'];
    }
    
    foreach ($uniqueActivities as $activityId => $activityData) {
        $totalPossible = $activityData['totalPossible'];
        $actualScores = $activityData['actualScores'];
        
        // For each student's score in this activity
        foreach ($actualScores as $actualScore) {
            if ($totalPossible > 0) {
                // Convert to percentage (like your example: 75/100 = 75%)
                $activityPercentage = ($actualScore / $totalPossible) * 100;
                $totalActualScores += $activityPercentage;
                $totalActivities++;
                $totalPossibleScores += 100; // Each activity contributes 100% possible
            }
        }
    }
    
    // Calculate academic percentage: (sum of all activity percentages) / (number of activities * 100)
    if ($totalPossibleScores > 0) {
        $academicPercentage = ($totalActualScores / $totalPossibleScores) * 100;
    }
    
    // ========== ATTENDANCE CALCULATION (YOUR METHOD) ==========
    $attendancePercentage = 0;
    if ($attendanceRaw && $attendanceRaw['totalDays'] > 0) {
        $totalDays = $attendanceRaw['totalDays'];
        $attendancePoints = ($attendanceRaw['presents'] * 100) + ($attendanceRaw['lates'] * 50);
        $totalPossibleAttendance = $totalDays * 100;
        $attendancePercentage = $totalPossibleAttendance > 0 
            ? ($attendancePoints / $totalPossibleAttendance) * 100 
            : 0;
    }
    
    // ========== FINAL WEIGHTED PERCENTAGE (YOUR METHOD: 75% academic, 25% attendance) ==========
    $finalPercentage = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
    
    return [
        "totalAssigned" => count($uniqueActivities),
        "totalSubmissions" => count($academicActivities),
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
}
?>