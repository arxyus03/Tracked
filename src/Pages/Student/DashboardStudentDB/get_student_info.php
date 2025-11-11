<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user ID from query parameter
    if (!isset($_GET['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    $userId = $_GET['id'];
    
    // Fetch user data from tracked_users table
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
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>