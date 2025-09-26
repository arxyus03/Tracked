<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Clear any output buffers
while (ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// Database connection settings
$dbHost = "localhost";
$dbUser = "root";
$dbPass = "";
$dbName = "tracked";

// Create DB connection
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}
$conn->set_charset('utf8mb4');

// Read JSON input
$raw = file_get_contents("php://input");
if (empty($raw)) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$idNumber = $data['id_number'] ?? '';
$inputPassword = $data['password'] ?? '';

if (empty($idNumber) || empty($inputPassword)) {
    echo json_encode(["success" => false, "message" => "Missing ID or Password"]);
    exit;
}

// Fetch user from DB
$sql = "SELECT tracked_password, tracked_Status, tracked_Role FROM tracked_users WHERE tracked_ID = ? LIMIT 1";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error"]);
    exit;
}

$stmt->bind_param("s", $idNumber);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Database query failed"]);
    $stmt->close();
    exit;
}

$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Account does not exist"]);
    $stmt->close();
    exit;
}

$stmt->bind_result($dbPasswordHash, $status, $role);
$stmt->fetch();
$stmt->close();

// Check status
if ($status !== 'Active') {
    echo json_encode(["success" => false, "message" => "User not verified or inactive"]);
    exit;
}

// DEBUG: Log the verification process
error_log("=== LOGIN ATTEMPT ===");
error_log("User ID: " . $idNumber);
error_log("Input password: " . $inputPassword);
error_log("Stored hash: " . $dbPasswordHash);
error_log("Stored hash length: " . strlen($dbPasswordHash));

// Verify password with comprehensive checking
$passwordValid = false;

// Method 1: Check if it's a valid password hash
if (password_verify($inputPassword, $dbPasswordHash)) {
    $passwordValid = true;
    error_log("Password verification: SUCCESS (proper hash)");
} 
// Method 2: Check if password was stored in plain text (fallback)
elseif ($inputPassword === $dbPasswordHash) {
    $passwordValid = true;
    error_log("Password verification: SUCCESS (plain text match)");
    
    // Upgrade to proper hashing for future logins
    $newHash = password_hash($inputPassword, PASSWORD_DEFAULT);
    $updateSql = "UPDATE tracked_users SET tracked_password = ? WHERE tracked_ID = ?";
    $upStmt = $conn->prepare($updateSql);
    if ($upStmt) {
        $upStmt->bind_param("ss", $newHash, $idNumber);
        $upStmt->execute();
        $upStmt->close();
        error_log("Password upgraded to hash");
    }
} 
// Method 3: Check if it's the exact hash string (for debugging)
elseif ($inputPassword === trim($dbPasswordHash)) {
    $passwordValid = true;
    error_log("Password verification: SUCCESS (exact hash match)");
}
else {
    error_log("Password verification: FAILED - All methods failed");
}

if (!$passwordValid) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

// Success response
echo json_encode([
    "success" => true,
    "user" => [
        "id" => $idNumber,
        "role" => $role
    ],
    "message" => "Login successful"
]);

error_log("Login successful for user: " . $idNumber);
$conn->close();
exit;
?>