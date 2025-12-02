<?php
// Add these headers at the top of your PHP file
header("Access-Control-Allow-Origin: *"); // Allow all origins
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing database connection and logic...
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$response = ['success' => false, 'message' => '', 'classes' => []];

try {
    // Check if it's a GET request with professor_ID parameter
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['professor_ID'])) {
        $professor_ID = $_GET['professor_ID'];
        
        // Validate professor_ID
        if (empty($professor_ID)) {
            throw new Exception("Professor ID is required");
        }

        // Fetch classes for the professor (only active classes)
        $sql = "SELECT * FROM classes WHERE professor_ID = ? AND status = 'Active' ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$professor_ID]);
        $classes = $stmt->fetchAll();

        $response['success'] = true;
        $response['classes'] = $classes;
        $response['message'] = 'Classes fetched successfully';
        
    } else {
        throw new Exception('Invalid request method or missing professor_ID parameter');
    }

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>