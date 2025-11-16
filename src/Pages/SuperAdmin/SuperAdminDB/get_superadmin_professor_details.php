<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$professorId = $_GET['id'] ?? '';

if (!empty($professorId)) {
    // Return single professor with all details
    $sql = "SELECT 
        tracked_ID,
        tracked_Role,
        tracked_email,
        tracked_firstname,
        tracked_lastname,
        tracked_middlename,
        tracked_program,
        tracked_phone,
        tracked_bday,
        tracked_gender,
        tracked_Status,
        created_at,
        updated_at
    FROM tracked_users 
    WHERE tracked_ID = ? AND tracked_Role = 'Professor'";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $professorId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $professor = $result->fetch_assoc();
        echo json_encode(["success" => true, "professor" => $professor]);
    } else {
        echo json_encode(["success" => false, "message" => "Professor not found"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Professor ID is required"]);
}

$conn->close();
?>