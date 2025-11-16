<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Clear any output buffers to prevent unwanted output
while (ob_get_level()) {
    ob_end_clean();
}

// Set headers FIRST to prevent any output issues
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection settings
$dbHost = "localhost";
$dbUser = "u713320770_trackedDB";
$dbPass = "Tracked@2025";
$dbName = "u713320770_tracked";

// Create DB connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}
$conn->set_charset('utf8mb4');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Read JSON input
$raw = file_get_contents("php://input");
if (empty($raw)) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data: " . json_last_error_msg()]);
    exit;
}

// Validate input
if (!isset($input['action'])) {
    echo json_encode(["success" => false, "message" => "Action is required"]);
    exit;
}

$action = $input['action'];

try {
    // Handle different actions
    if ($action === 'verify_token') {
        // Verify if token is valid and not expired
        if (!isset($input['token'])) {
            echo json_encode(["success" => false, "message" => "Token is required"]);
            exit;
        }
        
        $token = $input['token'];
        
        // Check if token exists and is not expired
        $stmt = $conn->prepare("SELECT tracked_ID, expiry, used FROM password_resets WHERE token = ?");
        if (!$stmt) {
            throw new Exception('Database error: ' . $conn->error);
        }
        
        $stmt->bind_param("s", $token);
        
        if (!$stmt->execute()) {
            throw new Exception('Database query failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Invalid or expired reset link"]);
            $stmt->close();
            exit;
        }
        
        $reset = $result->fetch_assoc();
        
        // Check if token has been used
        if ($reset['used']) {
            echo json_encode(["success" => false, "message" => "This reset link has already been used"]);
            $stmt->close();
            exit;
        }
        
        // Check if token has expired
        $now = new DateTime();
        $expiry = new DateTime($reset['expiry']);
        
        if ($now > $expiry) {
            echo json_encode(["success" => false, "message" => "This reset link has expired. Please request a new one."]);
            $stmt->close();
            exit;
        }
        
        // Token is valid
        echo json_encode(["success" => true, "message" => "Token is valid"]);
        $stmt->close();
        
    } elseif ($action === 'reset_password') {
        // Reset the password
        if (!isset($input['token']) || !isset($input['newPassword'])) {
            echo json_encode(["success" => false, "message" => "Token and new password are required"]);
            exit;
        }
        
        $token = $input['token'];
        $newPassword = $input['newPassword'];
        
        // Validate password length
        if (strlen($newPassword) < 8) {
            echo json_encode(["success" => false, "message" => "Password must be at least 8 characters long"]);
            exit;
        }
        
        // Check if token exists and is valid
        $stmt = $conn->prepare("SELECT tracked_ID, expiry, used FROM password_resets WHERE token = ?");
        if (!$stmt) {
            throw new Exception('Database error: ' . $conn->error);
        }
        
        $stmt->bind_param("s", $token);
        
        if (!$stmt->execute()) {
            throw new Exception('Database query failed: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Invalid or expired reset link"]);
            $stmt->close();
            exit;
        }
        
        $reset = $result->fetch_assoc();
        $trackedId = $reset['tracked_ID'];
        
        // Check if token has been used
        if ($reset['used']) {
            echo json_encode(["success" => false, "message" => "This reset link has already been used"]);
            $stmt->close();
            exit;
        }
        
        // Check if token has expired
        $now = new DateTime();
        $expiry = new DateTime($reset['expiry']);
        
        if ($now > $expiry) {
            echo json_encode(["success" => false, "message" => "This reset link has expired. Please request a new one."]);
            $stmt->close();
            exit;
        }
        
        // Hash the new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update the user's password
        $updateStmt = $conn->prepare("UPDATE tracked_users SET tracked_password = ? WHERE tracked_ID = ?");
        if (!$updateStmt) {
            throw new Exception('Database error: ' . $conn->error);
        }
        
        $updateStmt->bind_param("ss", $hashedPassword, $trackedId);
        
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update password: ' . $updateStmt->error);
        }
        
        // Mark the token as used
        $markStmt = $conn->prepare("UPDATE password_resets SET used = 1 WHERE token = ?");
        if (!$markStmt) {
            throw new Exception('Database error: ' . $conn->error);
        }
        
        $markStmt->bind_param("s", $token);
        
        if (!$markStmt->execute()) {
            throw new Exception('Failed to mark token as used: ' . $markStmt->error);
        }
        
        echo json_encode(["success" => true, "message" => "Password has been reset successfully"]);
        
        $markStmt->close();
        $updateStmt->close();
        $stmt->close();
        
    } else {
        echo json_encode(["success" => false, "message" => "Invalid action"]);
    }
    
} catch (Exception $e) {
    error_log("ForgotPass Error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later."
    ]);
}

$conn->close();
exit;
?>