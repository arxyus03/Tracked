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
$username = "root";
$password = "";
$database = "tracked";

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

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['announcement_ID']) || !isset($data['professor_ID'])) {
        $response['success'] = false;
        $response['message'] = "Missing required fields";
        echo json_encode($response);
        exit();
    }

    $announcement_ID = $data['announcement_ID'];
    $professor_ID = $data['professor_ID'];

    // Check if announcement exists and belongs to professor
    $check_query = "SELECT * FROM announcements WHERE announcement_ID = ? AND professor_ID = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("is", $announcement_ID, $professor_ID);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 0) {
        $response['success'] = false;
        $response['message'] = "Announcement not found or access denied";
        echo json_encode($response);
        exit();
    }

    // Delete announcement
    $delete_query = "DELETE FROM announcements WHERE announcement_ID = ? AND professor_ID = ?";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bind_param("is", $announcement_ID, $professor_ID);

    if ($delete_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Announcement deleted successfully";
    } else {
        $response['success'] = false;
        $response['message'] = "Error deleting announcement: " . $delete_stmt->error;
    }

    $delete_stmt->close();
    $check_stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>