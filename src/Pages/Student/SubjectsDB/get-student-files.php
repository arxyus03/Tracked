<?php
header('Content-Type: application/json');

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

// Database configuration
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

$activity_id = $_GET['activity_id'] ?? '';
$student_id = $_GET['student_id'] ?? '';

if (empty($activity_id) || empty($student_id)) {
    echo json_encode(['success' => false, 'message' => 'Activity ID and Student ID required']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get student's uploaded files for this activity
    $stmt = $conn->prepare("
        SELECT * FROM activity_files 
        WHERE activity_id = ? AND student_id = ? AND uploaded_by = 'student'
        ORDER BY uploaded_at DESC
    ");
    $stmt->execute([$activity_id, $student_id]);
    
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'files' => $files]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>