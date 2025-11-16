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

if (!$input || !isset($input['activity_ID'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Update activity to set archived status to 0 (unarchive)
    $stmt = $pdo->prepare("UPDATE activities SET archived = 0 WHERE id = ?");
    $stmt->execute([$input['activity_ID']]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Activity restored successfully"
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error restoring activity: " . $e->getMessage()]);
}
?>