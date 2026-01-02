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
    
    // Format deadline for database
    $formatted_deadline = null;
    if ($deadline && $deadline !== "") {
        // Frontend sends datetime in format: "2026-01-05T17:00" (which is UTC time)
        // We need to treat it as UTC and store as UTC
        
        // Remove the 'T' and add seconds for MySQLa
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

    $insert_stmt->bind_param("ssssss", $professor_ID, $classroom_ID, $title, $description, $link, $formatted_deadline);

    if ($insert_stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Announcement posted successfully";
        $response['announcement_ID'] = $insert_stmt->insert_id;
        
        // ✅ NEW: Send email notifications to students
        require_once __DIR__ . '/../EmailNotificationDB/send_student_email.php';
        
        // Get all students in this class - USING CORRECT COLUMN NAMES
        $students_query = "SELECT tu.tracked_ID, tu.tracked_email, tu.tracked_firstname, tu.tracked_lastname 
                          FROM student_classes sc 
                          JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID 
                          WHERE sc.subject_code = ? AND sc.archived = 0 AND tu.tracked_Status = 'Active'";
        $students_stmt = $conn->prepare($students_query);
        $students_stmt->bind_param("s", $classroom_ID);
        $students_stmt->execute();
        $students_result = $students_stmt->get_result();
        $students = $students_result->fetch_all(MYSQLI_ASSOC);
        
        if (count($students) > 0) {
            // Get class details for the email
            $class_query = "SELECT subject, section FROM classes WHERE subject_code = ?";
            $class_stmt = $conn->prepare($class_query);
            $class_stmt->bind_param("s", $classroom_ID);
            $class_stmt->execute();
            $class_result = $class_stmt->get_result();
            $class = $class_result->fetch_assoc();
            
            $emailSubject = "New Announcement: " . $title;
            $emailTitle = "New Announcement in " . $class['subject'] . " (" . $class['section'] . ")";
            
            // Format deadline for email display (show in Philippines time)
            $displayDeadline = "";
            if ($formatted_deadline) {
                $utcDate = new DateTime($formatted_deadline, new DateTimeZone('UTC'));
                $utcDate->setTimezone(new DateTimeZone('Asia/Manila'));
                $displayDeadline = $utcDate->format('M j, Y g:i A');
            }
            
            $emailMessage = "Professor has posted a new announcement:\n\n" . 
                           "Title: " . $title . "\n" .
                           "Instruction: " . $description . "\n" .
                           ($displayDeadline ? "Deadline: " . $displayDeadline . " (PHT)" : "");
            
            $emailResults = sendBatchStudentEmails($students, $emailSubject, $emailTitle, $emailMessage, 'general');
            $response['email_notifications'] = $emailResults;
        }
        
        $students_stmt->close();
    } else {
        $response['success'] = false;
        $response['message'] = "Error posting announcement: " . $insert_stmt->error;
    }

    $insert_stmt->close();
    $check_stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    $response['debug'] = $e->getTraceAsString();
}

echo json_encode($response);
$conn->close();
?>