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
header("Access-Control-Allow-Methods: POST");

// Database connection settings - UPDATED FOR HOST
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

// Fetch user from DB - UPDATED COLUMN NAMES to match your schema
$sql = "SELECT tracked_password, tracked_Status, tracked_Role, tracked_firstname, tracked_lastname, tracked_middlename 
        FROM tracked_users 
        WHERE tracked_ID = ? LIMIT 1";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
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

$stmt->bind_result($dbPasswordHash, $status, $role, $firstname, $lastname, $middlename);
$stmt->fetch();
$stmt->close();

// Check status
if ($status !== 'Active') {
    echo json_encode(["success" => false, "message" => "User not active or deactivated"]);
    exit;
}

// Verify password with comprehensive checking
$passwordValid = false;

// Method 1: Check if it's a valid password hash
if (password_verify($inputPassword, $dbPasswordHash)) {
    $passwordValid = true;
} 
// Method 2: Check if password was stored in plain text (fallback)
elseif ($inputPassword === $dbPasswordHash) {
    $passwordValid = true;
    
    // Upgrade to proper hashing for future logins
    $newHash = password_hash($inputPassword, PASSWORD_DEFAULT);
    $updateSql = "UPDATE tracked_users SET tracked_password = ? WHERE tracked_ID = ?";
    $upStmt = $conn->prepare($updateSql);
    if ($upStmt) {
        $upStmt->bind_param("ss", $newHash, $idNumber);
        $upStmt->execute();
        $upStmt->close();
    }
}

if (!$passwordValid) {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
    exit;
}

// Format full name
$fullName = trim($firstname . ' ' . ($middlename ? $middlename . " " : '') . $lastname);

// Success response
echo json_encode([
    "success" => true,
    "user" => [
        "id" => $idNumber,
        "role" => $role,
        "firstname" => $firstname,
        "lastname" => $lastname,
        "middlename" => $middlename,
        "fullName" => $fullName
    ],
    "message" => "Login successful"
]);

$conn->close();
exit;
?>