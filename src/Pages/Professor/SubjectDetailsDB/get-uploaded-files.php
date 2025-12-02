<?php
header('Content-Type: application/json');

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'tracked';

$activity_id = $_GET['activity_id'] ?? '';
$student_id = $_GET['student_id'] ?? '';

if (empty($activity_id)) {
    echo json_encode(['success' => false, 'message' => 'Activity ID required']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if (!empty($student_id)) {
        // Get files for specific student
        $stmt = $conn->prepare("
            SELECT * FROM activity_files 
            WHERE activity_id = ? AND student_id = ? AND uploaded_by = 'professor'
            ORDER BY uploaded_at DESC
        ");
        $stmt->execute([$activity_id, $student_id]);
    } else {
        // Get all files for activity
        $stmt = $conn->prepare("
            SELECT * FROM activity_files 
            WHERE activity_id = ? AND uploaded_by = 'professor'
            ORDER BY uploaded_at DESC
        ");
        $stmt->execute([$activity_id]);
    }
    
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'files' => $files]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>