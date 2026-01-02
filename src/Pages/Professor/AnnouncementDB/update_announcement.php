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

// Set timezone for PHP
date_default_timezone_set('Asia/Manila'); // Set to Philippines timezone for input processing

$response = array();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['announcement_ID']) || !isset($data['professor_ID']) || 
        !isset($data['title']) || !isset($data['description'])) {
        $response['success'] = false;
        $response['message'] = "Missing required fields";
        echo json_encode($response);
        exit();
    }

    $announcement_ID = $data['announcement_ID'];
    $professor_ID = $data['professor_ID'];
    $title = $data['title'];
    $description = $data['description'];
    $link = isset($data['link']) ? $data['link'] : null;
    $deadline = isset($data['deadline']) ? $data['deadline'] : null;

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

    // Update announcement
    $update_query = "UPDATE announcements SET title = ?, description = ?, link = ?, deadline = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE announcement_ID = ? AND professor_ID = ?";
    $update_stmt = $conn->prepare($update_query);
    
    // Format deadline for database
    $formatted_deadline = null;
    if ($deadline && $deadline !== "") {
        // Frontend sends datetime in format: "2026-01-05T17:00" (which is UTC time)
        // We need to treat it as UTC and store as UTC
        
        // Remove the 'T' and add seconds for MySQL
        $mysql_format = str_replace('T', ' ', $deadline) . ':00';
        
        // Create DateTime object, explicitly set as UTC
        $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $mysql_format, new DateTimeZone('UTC'));
        
        if ($dateTime) {
            $formatted_deadline = $dateTime->format('Y-m-d H:i:s');
        } else {
            // Fallback to simple conversion
            $formatted_deadline = date('Y-m-d H:i:s', strtotime($deadline . ' UTC'));
        }
        
        // Debug log
        error_log("Deadline processing - Input: $deadline, Output: $formatted_deadline");
    }

    $update_stmt->bind_param("ssssis", $title, $description, $link, $formatted_deadline, $announcement_ID, $professor_ID);

    if ($update_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Announcement updated successfully";
    } else {
        $response['success'] = false;
        $response['message'] = "Error updating announcement: " . $update_stmt->error;
    }

    $update_stmt->close();
    $check_stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    $response['debug'] = $e->getTraceAsString();
}

echo json_encode($response);
$conn->close();
?>