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

try {
    // Get the raw POST data
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (!isset($data['professor_ID']) || !isset($data['classroom_ID']) || 
        !isset($data['title']) || !isset($data['description'])) {
        $response['success'] = false;
        $response['message'] = "Missing required fields";
        echo json_encode($response);
        exit();
    }

    $professor_ID = $data['professor_ID'];
    $classroom_ID = $data['classroom_ID'];
    $title = $data['title'];
    $description = $data['description'];
    $link = isset($data['link']) ? $data['link'] : null;
    $deadline = isset($data['deadline']) ? $data['deadline'] : null;

    // Validate if professor exists and has access to this classroom
    $check_query = "SELECT * FROM classes WHERE subject_code = ? AND professor_ID = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("ss", $classroom_ID, $professor_ID);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 0) {
        $response['success'] = false;
        $response['message'] = "Professor does not have access to this classroom or classroom does not exist";
        echo json_encode($response);
        exit();
    }

    // Insert the announcement
    $insert_query = "INSERT INTO announcements (professor_ID, classroom_ID, title, description, link, deadline) 
                     VALUES (?, ?, ?, ?, ?, ?)";
    $insert_stmt = $conn->prepare($insert_query);
    
    // Format deadline for database if provided
    $formatted_deadline = null;
    if ($deadline) {
        $formatted_deadline = date('Y-m-d H:i:s', strtotime($deadline));
    }

    $insert_stmt->bind_param("ssssss", $professor_ID, $classroom_ID, $title, $description, $link, $formatted_deadline);

    if ($insert_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Announcement posted successfully";
        $response['announcement_ID'] = $insert_stmt->insert_id;
    } else {
        $response['success'] = false;
        $response['message'] = "Error posting announcement: " . $insert_stmt->error;
    }

    $insert_stmt->close();
    $check_stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>