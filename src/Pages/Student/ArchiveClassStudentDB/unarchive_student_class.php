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

    // Unarchive the class (set archived = 0 and clear archived_at)
    $stmt = $pdo->prepare("UPDATE student_classes SET archived = 0, archived_at = NULL WHERE student_ID = ? AND subject_code = ?");
    $stmt->execute([$student_id, $subject_code]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Class restored successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Class not found or already restored"
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error restoring class: " . $e->getMessage()]);
}
?>