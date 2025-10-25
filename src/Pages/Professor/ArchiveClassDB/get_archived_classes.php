<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$response = ['success' => false, 'message' => '', 'classes' => []];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Only GET requests are allowed');
    }

    $professor_ID = isset($_GET['professor_ID']) ? trim($_GET['professor_ID']) : '';

    if (empty($professor_ID)) {
        throw new Exception('Professor ID is required');
    }

    // Fetch archived classes
    $sql = "SELECT * FROM classes WHERE professor_ID = ? AND status = 'Archived' ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$professor_ID]);
    $classes = $stmt->fetchAll();

    $response['success'] = true;
    $response['message'] = 'Archived classes fetched successfully';
    $response['classes'] = $classes;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>