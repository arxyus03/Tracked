<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['user_id']) || !isset($input['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID and password are required'
        ]);
        exit;
    }
    
    $userId = $input['user_id'];
    $password = $input['password'];
    $newEmail = isset($input['email']) ? $input['email'] : null;
    $newPhone = isset($input['phone']) ? $input['phone'] : null;
    
    // Verify password
    $stmt = $conn->prepare("SELECT tracked_password FROM tracked_users WHERE tracked_ID = :id");
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Verify password
    if (!password_verify($password, $user['tracked_password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Incorrect password'
        ]);
        exit;
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [':id' => $userId];
    
    if ($newEmail !== null && $newEmail !== '') {
        // Check if email already exists for another user
        $emailCheck = $conn->prepare("SELECT tracked_ID FROM tracked_users WHERE tracked_email = :email AND tracked_ID != :id");
        $emailCheck->execute([':email' => $newEmail, ':id' => $userId]);
        if ($emailCheck->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Email address already in use'
            ]);
            exit;
        }
        $updates[] = "tracked_email = :email";
        $params[':email'] = $newEmail;
    }
    
    if ($newPhone !== null && $newPhone !== '') {
        $updates[] = "tracked_phone = :phone";
        $params[':phone'] = $newPhone;
    }
    
    // If no updates, return error
    if (empty($updates)) {
        echo json_encode([
            'success' => false,
            'message' => 'No changes to update'
        ]);
        exit;
    }
    
    // Perform update
    $sql = "UPDATE tracked_users SET " . implode(', ', $updates) . " WHERE tracked_ID = :id";
    $updateStmt = $conn->prepare($sql);
    $updateStmt->execute($params);
    
    // Fetch updated user data
    $fetchStmt = $conn->prepare("SELECT tracked_email, tracked_phone FROM tracked_users WHERE tracked_ID = :id");
    $fetchStmt->bindParam(':id', $userId);
    $fetchStmt->execute();
    $updatedUser = $fetchStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Account information updated successfully',
        'data' => $updatedUser
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>