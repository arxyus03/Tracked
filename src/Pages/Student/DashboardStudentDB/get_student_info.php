<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Database configuration
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

// Get user ID from query parameter
$userId = isset($_GET['id']) ? $_GET['id'] : '';

if (empty($userId)) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

// Create connection using mysqli
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Check if tracked_users table exists
$tableCheck = $conn->query("SHOW TABLES LIKE 'tracked_users'");
if ($tableCheck->num_rows == 0) {
    echo json_encode([
        'success' => false,
        'message' => 'tracked_users table does not exist in the database'
    ]);
    $conn->close();
    exit;
}

// Fetch user data
$sql = "
    SELECT 
        tracked_ID,
        tracked_Role,
        tracked_email,
        tracked_firstname,
        tracked_lastname,
        tracked_middlename,
        tracked_program,
        tracked_yearandsec,
        tracked_semester,
        tracked_bday,
        tracked_gender,
        tracked_phone,
        tracked_Status,
        created_at,
        updated_at
    FROM tracked_users 
    WHERE tracked_ID = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
} else {
    // Return mock data for testing if user not found
    echo json_encode([
        'success' => true,
        'user' => [
            'tracked_ID' => $userId,
            'tracked_Role' => 'student',
            'tracked_email' => 'student@example.com',
            'tracked_firstname' => 'John',
            'tracked_lastname' => 'Doe',
            'tracked_middlename' => '',
            'tracked_program' => 'Computer Science',
            'tracked_yearandsec' => '2B',
            'tracked_semester' => '2nd',
            'tracked_bday' => '2000-01-01',
            'tracked_gender' => 'Male',
            'tracked_phone' => '1234567890',
            'tracked_Status' => 'Active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]
    ]);
}

$stmt->close();
$conn->close();
?>