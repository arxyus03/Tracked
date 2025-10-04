<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for CORS and JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Database configuration
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "tracked");

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Action is required']);
    exit();
}

$action = $input['action'];

try {
    // Connect to database
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Handle different actions
    if ($action === 'verify_token') {
        // Verify if token is valid and not expired
        if (!isset($input['token'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Token is required']);
            exit();
        }
        
        $token = $input['token'];
        
        // Check if token exists and is not expired
        $stmt = $conn->prepare("SELECT tracked_ID, expiry, used FROM password_resets WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Invalid reset link']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        $reset = $result->fetch_assoc();
        
        // Check if token has been used
        if ($reset['used']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This reset link has already been used']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        // Check if token has expired
        $now = new DateTime();
        $expiry = new DateTime($reset['expiry']);
        
        if ($now > $expiry) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This reset link has expired. Please request a new one.']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        // Token is valid
        echo json_encode(['success' => true, 'message' => 'Token is valid']);
        $stmt->close();
        $conn->close();
        
    } elseif ($action === 'reset_password') {
        // Reset the password
        if (!isset($input['token']) || !isset($input['newPassword'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Token and new password are required']);
            exit();
        }
        
        $token = $input['token'];
        $newPassword = $input['newPassword'];
        
        // Validate password length
        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
            exit();
        }
        
        // Check if token exists and is valid
        $stmt = $conn->prepare("SELECT tracked_ID, expiry, used FROM password_resets WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Invalid reset link']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        $reset = $result->fetch_assoc();
        $trackedId = $reset['tracked_ID'];
        
        // Check if token has been used
        if ($reset['used']) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This reset link has already been used']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        // Check if token has expired
        $now = new DateTime();
        $expiry = new DateTime($reset['expiry']);
        
        if ($now > $expiry) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'This reset link has expired']);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        // Hash the new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update the user's password
        $stmt = $conn->prepare("UPDATE tracked_users SET tracked_password = ?, updated_at = CURRENT_TIMESTAMP WHERE tracked_ID = ?");
        $stmt->bind_param("ss", $hashedPassword, $trackedId);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update password');
        }
        
        // Mark the token as used
        $stmt = $conn->prepare("UPDATE password_resets SET used = TRUE WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Password has been reset successfully']);
        $stmt->close();
        $conn->close();
        
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred. Please try again later.'
    ]);
    error_log($e->getMessage());
}
?>