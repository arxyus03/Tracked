<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$adminId = $_GET['id'] ?? '';

if (!empty($adminId)) {
    // Return single admin with all details
    $sql = "SELECT 
        tracked_ID,
        tracked_Role,
        tracked_email,
        tracked_firstname,
        tracked_lastname,
        tracked_middlename,
        tracked_Status,
        created_at,
        updated_at
    FROM tracked_users 
    WHERE tracked_ID = ? AND tracked_Role = 'Admin'";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $adminId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();
        echo json_encode(["success" => true, "admin" => $admin]);
    } else {
        echo json_encode(["success" => false, "message" => "Admin not found"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Admin ID is required"]);
}

$conn->close();
?>