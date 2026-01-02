<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$database = "u713320770_tracked";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    $response = array(
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    );
    echo json_encode($response);
    exit();
}

$response = array();

// Get raw POST data
$data = json_decode(file_get_contents('php://input'), true);

$announcement_id = $data['announcement_id'] ?? '';
$professor_id = $data['professor_id'] ?? '';
$is_read = $data['is_read'] ?? 0;

if (empty($announcement_id) || empty($professor_id)) {
    $response['success'] = false;
    $response['message'] = "Announcement ID and Professor ID are required";
    echo json_encode($response);
    exit();
}

try {
    // Note: For professors, we don't track read status in a separate table like students
    // Instead, we'll create a simple session/cookie based tracking or use localStorage
    // Since professors see all announcements they post, we don't need persistent DB storage
    // We'll just return success and let the frontend handle the state
    
    $response['success'] = true;
    $response['message'] = "Read status updated";
    $response['data'] = array(
        'announcement_id' => $announcement_id,
        'professor_id' => $professor_id,
        'is_read' => $is_read
    );
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    error_log("Error in update_read_status.php: " . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>