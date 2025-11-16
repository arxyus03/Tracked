<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

if (empty($input['student_id']) || empty($input['subject_code'])) {
    echo json_encode(["success" => false, "message" => "Student ID and Subject Code are required"]);
    exit;
}

try {
    $student_id = $input['student_id'];
    $subject_code = $input['subject_code'];

    // Check if the student is enrolled in this class
    $checkStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ?");
    $checkStmt->execute([$student_id, $subject_code]);
    $enrollment = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$enrollment) {
        echo json_encode([
            "success" => false,
            "message" => "You are not enrolled in this class"
        ]);
        exit;
    }

    // Mark the class as archived instead of deleting
    $archiveStmt = $pdo->prepare("UPDATE student_classes SET archived = 1, archived_at = NOW() WHERE student_ID = ? AND subject_code = ?");
    $archiveStmt->execute([$student_id, $subject_code]);
    
    if ($archiveStmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Class archived successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to archive class"
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error archiving class: " . $e->getMessage()]);
}
?>