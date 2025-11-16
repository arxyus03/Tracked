<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$studentId = $_GET['id'] ?? '';

if (!empty($studentId)) {
    // Return single student with all details
    $sql = "SELECT 
        tracked_ID,
        tracked_Role,
        tracked_email,
        tracked_firstname,
        tracked_lastname,
        tracked_middlename,
        tracked_program,
        tracked_yearandsec,
        tracked_semester,
        tracked_bday,
        tracked_gender,
        tracked_phone,
        tracked_Status,
        created_at,
        updated_at
    FROM tracked_users 
    WHERE tracked_ID = ? AND tracked_Role = 'Student'";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        echo json_encode(["success" => true, "student" => $student]);
    } else {
        echo json_encode(["success" => false, "message" => "Student not found"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Student ID is required"]);
}

$conn->close();
?>