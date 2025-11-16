<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "u713320770_trackedDB", "Tracked@2025", "u713320770_tracked");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['id'] ?? '';
$status = $data['status'] ?? '';
$userType = $data['userType'] ?? '';

$roleMap = [
    'admin' => 'Admin',
    'professor' => 'Professor',
    'student' => 'Student'
];

if (!empty($userId) && !empty($status) && !empty($userType) && isset($roleMap[$userType])) {
    $role = $roleMap[$userType];
    
    $sql = "UPDATE tracked_users SET tracked_Status = ?, updated_at = NOW() WHERE tracked_ID = ? AND tracked_Role = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $status, $userId, $role);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => ucfirst($userType) . " status updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update " . $userType . " status"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Missing required fields or invalid user type"]);
}

$conn->close();
?>