<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$response = ['success' => false, 'message' => ''];

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['subject_code']) || empty($input['professor_ID'])) {
        throw new Exception('Subject code and professor ID are required');
    }

    $subject_code = trim($input['subject_code']);
    $professor_ID = trim($input['professor_ID']);

    // Update class status back to 'Active'
    $sql = "UPDATE classes SET status = 'Active' WHERE subject_code = ? AND professor_ID = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$subject_code, $professor_ID]);

    if ($result && $stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = 'Class unarchived successfully';
    } else {
        throw new Exception('Class not found or already active');
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>