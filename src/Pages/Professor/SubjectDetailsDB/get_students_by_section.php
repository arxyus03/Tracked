<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

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

$subject_code = $_GET['subject_code'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject Code is required"]);
    exit;
}

try {
    // Fetch students from tracked_users + student_classes - FIXED: removed sc.section
    $sql = "
        SELECT 
            t.tracked_ID,
            t.tracked_firstname,
            t.tracked_middlename,
            t.tracked_lastname,
            t.tracked_email,
            t.tracked_gender,
            t.tracked_yearandsec,
            sc.enrolled_at
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        WHERE t.tracked_Role = 'Student'
        AND t.tracked_Status = 'Active'
        AND sc.subject_code = ?
        AND sc.archived = 0
        ORDER BY t.tracked_lastname, t.tracked_firstname
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_code]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch class info with professor details
    $classStmt = $pdo->prepare("
        SELECT 
            c.subject_code, 
            c.subject, 
            c.section, 
            c.professor_ID,
            CONCAT(p.tracked_firstname, ' ', p.tracked_lastname) as professor_name
        FROM classes c
        LEFT JOIN tracked_users p ON c.professor_ID = p.tracked_ID
        WHERE c.subject_code = ?
    ");
    $classStmt->execute([$subject_code]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);

    // Debug info
    error_log("Students by Section - Subject: $subject_code");
    error_log("Students found: " . count($students));
    error_log("Class info: " . json_encode($classInfo));

    echo json_encode([
        "success" => true, 
        "students" => $students, 
        "class_info" => $classInfo,
        "debug" => [
            "total_students" => count($students),
            "class_details" => $classInfo
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching students: " . $e->getMessage()]);
}
?>