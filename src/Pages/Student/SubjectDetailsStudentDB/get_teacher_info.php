<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection - UPDATED WITH YOUR CREDENTIALS
$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]);
    exit();
}

// Get subject code from query parameters
$subject_code = isset($_GET['subject_code']) ? $_GET['subject_code'] : '';

// Validate input
if (empty($subject_code)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Subject code is required"
    ]);
    exit();
}

// Sanitize input
$subject_code = $conn->real_escape_string($subject_code);

try {
    // Query to get professor ID from classes table
    $classQuery = "SELECT professor_ID FROM classes WHERE subject_code = ? AND status = 'Active'";
    
    $stmt = $conn->prepare($classQuery);
    $stmt->bind_param("s", $subject_code);
    $stmt->execute();
    $classResult = $stmt->get_result();
    
    if ($classResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Subject not found or inactive"
        ]);
        exit();
    }
    
    $classData = $classResult->fetch_assoc();
    $professor_id = $classData['professor_ID'];
    $stmt->close();
    
    // Query to get teacher details from tracked_users table
    $teacherQuery = "SELECT 
                        tracked_ID,
                        CONCAT(tracked_firstname, ' ', tracked_lastname) as teacher_name,
                        tracked_email as teacher_email,
                        tracked_firstname,
                        tracked_lastname,
                        tracked_middlename
                    FROM tracked_users 
                    WHERE tracked_ID = ? AND tracked_Role = 'Professor' AND tracked_Status = 'Active'";
    
    $stmt = $conn->prepare($teacherQuery);
    $stmt->bind_param("s", $professor_id);
    $stmt->execute();
    $teacherResult = $stmt->get_result();
    
    if ($teacherResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Teacher not found or inactive"
        ]);
        exit();
    }
    
    $teacherData = $teacherResult->fetch_assoc();
    $stmt->close();
    
    // Format the name with middle initial if available
    $teacher_name = $teacherData['teacher_name'];
    if (!empty($teacherData['tracked_middlename'])) {
        $middle_initial = substr($teacherData['tracked_middlename'], 0, 1) . '.';
        $teacher_name = $teacherData['tracked_firstname'] . ' ' . $middle_initial . ' ' . $teacherData['tracked_lastname'];
    }
    
    // Return success response
    echo json_encode([
        "success" => true,
        "teacher_id" => $teacherData['tracked_ID'],
        "teacher_name" => $teacher_name,
        "teacher_email" => $teacherData['teacher_email'],
        "first_name" => $teacherData['tracked_firstname'],
        "last_name" => $teacherData['tracked_lastname'],
        "middle_name" => $teacherData['tracked_middlename'],
        "subject_code" => $subject_code
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>