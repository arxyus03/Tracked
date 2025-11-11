<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

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

$section = $_GET['section'] ?? '';
$subject_code = $_GET['subject_code'] ?? '';

if (empty($section) || empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Section and Subject Code are required"]);
    exit;
}

try {
    // Get students who are enrolled in this specific class from tracked_users table
    $sql = "
        SELECT 
            t.tracked_ID as user_ID, 
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name,
            t.tracked_email as user_Email,
            t.tracked_gender as user_Gender,
            t.tracked_yearandsec as YearandSection,
            sc.enrolled_at
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        WHERE t.tracked_Role = 'Student' 
        AND t.tracked_Status = 'Active'
        AND sc.subject_code = ?
        AND sc.archived = 0
        ORDER BY t.tracked_fname, t.tracked_lname
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_code]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For debugging - get class info
    $classStmt = $pdo->prepare("SELECT subject_code, subject, section FROM classes WHERE subject_code = ?");
    $classStmt->execute([$subject_code]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "students" => $students,
        "class_info" => $classInfo,
        "debug" => [
            "requested_section" => $section,
            "requested_subject_code" => $subject_code,
            "student_count" => count($students),
            "class_found" => $classInfo ? true : false,
            "class_section" => $classInfo['section'] ?? 'N/A'
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching students: " . $e->getMessage()]);
}
?>