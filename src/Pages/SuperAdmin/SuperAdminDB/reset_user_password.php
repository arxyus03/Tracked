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
$userType = $data['userType'] ?? '';

$roleMap = [
    'admin' => 'Admin',
    'professor' => 'Professor',
    'student' => 'Student'
];

if (!empty($userId) && !empty($userType) && isset($roleMap[$userType])) {
    $role = $roleMap[$userType];
    $defaultPassword = password_hash('password123', PASSWORD_DEFAULT); // Default password
    
    $sql = "UPDATE tracked_users SET tracked_password = ?, updated_at = NOW() WHERE tracked_ID = ? AND tracked_Role = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $defaultPassword, $userId, $role);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => ucfirst($userType) . " password reset successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to reset " . $userType . " password"]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Missing required fields or invalid user type"]);
}

$conn->close();
?>