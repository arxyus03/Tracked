<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

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

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject Code is required"]);
    exit;
}

try {
    // Fetch students from tracked_users + student_classes
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

    // Fetch class info
    $classStmt = $pdo->prepare("SELECT subject_code, subject, section FROM classes WHERE subject_code = ?");
    $classStmt->execute([$subject_code]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "students" => $students, "class_info" => $classInfo]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching students: " . $e->getMessage()]);
}
