<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Return all students
$sql = "SELECT 
    tracked_ID,
    tracked_Role,
    tracked_email,
    tracked_firstname,
    tracked_lastname,
    tracked_middlename,
    tracked_yearandsec,
    tracked_Status
FROM tracked_users 
WHERE tracked_Role = 'Student' 
ORDER BY tracked_ID";

$result = $conn->query($sql);

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode($students);

$conn->close();
?>