<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = '127.0.0.1';
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['activity_ID'])) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE activities 
        SET 
            activity_type = ?,
            task_number = ?,
            title = ?,
            instruction = ?,
            link = ?,
            points = ?,
            deadline = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $input['activity_type'] ?? '',
        $input['task_number'] ?? '',
        $input['title'] ?? '',
        $input['instruction'] ?? '',
        $input['link'] ?? '',
        $input['points'] ?? 0,
        $input['deadline'] ?? null,
        $input['activity_ID']
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Activity updated successfully"
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error updating activity: " . $e->getMessage()]);
}
?>