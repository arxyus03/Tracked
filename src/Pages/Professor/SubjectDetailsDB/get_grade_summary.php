<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Localhost MySQL connection - consistent with your other files
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Required parameters
$subject_code   = $_GET['subject_code'] ?? null;
$section        = $_GET['section'] ?? null;
$professor_ID   = $_GET['professor_ID'] ?? null;

if (!$subject_code || !$section || !$professor_ID) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required parameters: subject_code, section, professor_ID"
    ]);
    exit;
}

try {
    // First, verify the class exists and get class details
    $classStmt = $pdo->prepare("
        SELECT subject_code, subject, section, professor_ID 
        FROM classes 
        WHERE subject_code = ? AND section = ? AND professor_ID = ?
    ");
    $classStmt->execute([$subject_code, $section, $professor_ID]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);

    if (!$classInfo) {
        echo json_encode([
            "success" => false,
            "message" => "Class not found or you don't have access to this class"
        ]);
        exit;
    }

    // Get the list of students enrolled in this specific class
    $studentsStmt = $pdo->prepare("
        SELECT student_ID 
        FROM student_classes 
        WHERE subject_code = ? AND archived = 0
    ");
    $studentsStmt->execute([$subject_code]);
    $enrolledStudents = $studentsStmt->fetchAll(PDO::FETCH_COLUMN, 0);
    
    $studentCount = count($enrolledStudents);

    // If no students are enrolled, return empty data
    if ($studentCount === 0) {
        $activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
        $emptyData = [];
        
        foreach ($activityTypes as $type) {
            $emptyData[] = [
                "activityType" => $type,
                "assignedWorks" => 0,
                "submissions" => 0,
                "missedSubmissions" => 0,
                "totalScores" => 0,
                "sumGradedWorks" => 0,
                "percentage" => "0%"
            ];
        }
        
        echo json_encode([
            "success" => true,
            "data" => $emptyData,
            "class_info" => $classInfo,
            "summary" => [
                "totalAssigned" => 0,
                "totalSubmissions" => 0,
                "totalScores" => 0,
                "totalGradedWorks" => 0,
                "overallPercentage" => 0
            ],
            "debug" => [
                "message" => "No students enrolled in this class"
            ]
        ]);
        exit;
    }

    // Create a placeholder string for the IN clause
    $placeholders = str_repeat('?,', count($enrolledStudents) - 1) . '?';

    // Get grade summary for activities created by this professor for this specific class
    // Only count activities and submissions for enrolled students in this class
    $sql = "
    SELECT 
        a.activity_type as activityType,
        COUNT(DISTINCT a.id) AS assignedWorks,
        -- Count submissions only from enrolled students
        COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END) AS submissions,
        -- Calculate missed submissions: (activities * enrolled students) - submissions
        (COUNT(DISTINCT a.id) * ? - COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END)) AS missedSubmissions,
        SUM(a.points) AS totalScores,
        SUM(COALESCE(ag.grade, 0)) AS sumGradedWorks,
        CASE 
            WHEN SUM(a.points) > 0 THEN 
                CONCAT(ROUND((SUM(COALESCE(ag.grade, 0)) / SUM(a.points)) * 100, 2), '%')
            ELSE '0%'
        END AS percentage
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND (a.archived = 0 OR a.archived IS NULL)
    GROUP BY a.activity_type
    ORDER BY a.activity_type ASC
    ";

    // Prepare parameters for the query
    $params = array_merge(
        $enrolledStudents, // First set of placeholders for submissions
        [$studentCount],   // Student count for missed submissions calculation
        $enrolledStudents, // Second set of placeholders for missed submissions
        [$subject_code, $professor_ID] // Subject and professor filters
    );

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Also get overall totals for the summary section - only for enrolled students
    $summarySql = "
    SELECT 
        COUNT(DISTINCT a.id) AS totalAssignedWorks,
        -- Count submissions only from enrolled students
        COUNT(DISTINCT CASE WHEN ag.submitted = 1 AND ag.student_ID IN ($placeholders) THEN CONCAT(a.id, '-', ag.student_ID) ELSE NULL END) AS totalSubmissions,
        SUM(a.points) AS totalPossibleScores,
        SUM(COALESCE(ag.grade, 0)) AS totalGradedWorks,
        CASE 
            WHEN SUM(a.points) > 0 THEN 
                ROUND((SUM(COALESCE(ag.grade, 0)) / SUM(a.points)) * 100, 2)
            ELSE 0
        END AS overallPercentage
    FROM activities a
    LEFT JOIN activity_grades ag ON ag.activity_ID = a.id
    WHERE 
        a.subject_code = ?
        AND a.professor_ID = ?
        AND (a.archived = 0 OR a.archived IS NULL)
    ";

    $summaryParams = array_merge(
        $enrolledStudents, // Placeholders for enrolled students
        [$subject_code, $professor_ID] // Subject and professor filters
    );

    $summaryStmt = $pdo->prepare($summarySql);
    $summaryStmt->execute($summaryParams);
    $summaryData = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    // Debug: Check if we're getting any data
    error_log("Grade Summary Debug - Subject: $subject_code, Section: $section, Professor: $professor_ID");
    error_log("Enrolled students: " . implode(', ', $enrolledStudents));
    error_log("Student count: $studentCount");
    error_log("Activities found: " . count($data));
    error_log("Summary data: " . json_encode($summaryData));

    // Ensure all activity types always appear
    $activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
    $formattedData = [];

    foreach ($activityTypes as $type) {
        $found = false;
        foreach ($data as $row) {
            if ($row['activityType'] === $type) {
                $formattedData[] = [
                    "activityType" => $type,
                    "assignedWorks" => intval($row['assignedWorks']),
                    "submissions" => intval($row['submissions']),
                    "missedSubmissions" => intval($row['missedSubmissions']),
                    "totalScores" => intval($row['totalScores']),
                    "sumGradedWorks" => floatval($row['sumGradedWorks']),
                    "percentage" => $row['percentage']
                ];
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $formattedData[] = [
                "activityType" => $type,
                "assignedWorks" => 0,
                "submissions" => 0,
                "missedSubmissions" => 0,
                "totalScores" => 0,
                "sumGradedWorks" => 0,
                "percentage" => "0%"
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "data" => $formattedData,
        "class_info" => $classInfo,
        "summary" => [
            "totalAssigned" => intval($summaryData['totalAssignedWorks'] ?? 0),
            "totalSubmissions" => intval($summaryData['totalSubmissions'] ?? 0),
            "totalScores" => intval($summaryData['totalPossibleScores'] ?? 0),
            "totalGradedWorks" => floatval($summaryData['totalGradedWorks'] ?? 0),
            "overallPercentage" => floatval($summaryData['overallPercentage'] ?? 0)
        ],
        "debug" => [
            "query_params" => [
                "subject_code" => $subject_code,
                "section" => $section,
                "professor_ID" => $professor_ID
            ],
            "enrolled_students" => $enrolledStudents,
            "student_count" => $studentCount,
            "activities_count" => count($data),
            "summary_totals" => $summaryData
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Error fetching grade summary: " . $e->getMessage()
    ]);
}
?>