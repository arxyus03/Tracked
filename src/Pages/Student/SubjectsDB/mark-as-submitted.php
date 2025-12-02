<?php
header('Content-Type: application/json');

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0);
}

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'tracked';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['activity_id']) || !isset($data['student_id'])) {
    echo json_encode(['success' => false, 'message' => 'Activity ID and Student ID required']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if student has uploaded any files for this activity
    $checkStmt = $conn->prepare("
        SELECT COUNT(*) as file_count FROM activity_files 
        WHERE activity_id = ? AND student_id = ? AND uploaded_by = 'student'
    ");
    $checkStmt->execute([$data['activity_id'], $data['student_id']]);
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['file_count'] == 0) {
        echo json_encode(['success' => false, 'message' => 'Please upload at least one file before submitting']);
        exit();
    }
    
    // Mark activity as submitted in activity_grades table
    $stmt = $conn->prepare("
        UPDATE activity_grades 
        SET submitted = 1,
            submitted_at = NOW(),
            late = CASE 
                WHEN deadline < NOW() THEN 1 
                ELSE 0 
            END
        WHERE activity_ID = ? AND student_ID = ?
    ");
    
    $stmt->execute([$data['activity_id'], $data['student_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Activity marked as submitted successfully'
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>