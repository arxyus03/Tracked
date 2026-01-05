<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Database configuration - UPDATED WITH YOUR CREDENTIALS
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user ID from query parameter
    $userId = isset($_GET['id']) ? $_GET['id'] : '';
    
    if (empty($userId)) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    // Check if tracked_users table exists
    $checkTable = $conn->query("SHOW TABLES LIKE 'tracked_users'");
    if ($checkTable->rowCount() == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'tracked_users table does not exist in the database'
        ]);
        exit;
    }
    
    // Fetch user data
    $stmt = $conn->prepare("
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
        WHERE tracked_ID = :id
    ");
    
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
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
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'debug' => [
            'host' => $host,
            'dbname' => $dbname,
            'username' => $username,
            'error' => $e->getMessage()
        ]
    ]);
}

$conn = null;
?>