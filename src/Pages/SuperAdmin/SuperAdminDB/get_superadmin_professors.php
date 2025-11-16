<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Return all professors
$sql = "SELECT 
    tracked_ID,
    tracked_Role,
    tracked_email,
    tracked_firstname,
    tracked_lastname,
    tracked_middlename,
    tracked_Status
FROM tracked_users 
WHERE tracked_Role = 'Professor' 
ORDER BY tracked_ID";

$result = $conn->query($sql);

$professors = [];
while ($row = $result->fetch_assoc()) {
    $professors[] = $row;
}

echo json_encode($professors);

$conn->close();
?>