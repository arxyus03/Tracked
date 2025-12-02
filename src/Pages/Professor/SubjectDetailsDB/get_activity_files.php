<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Database configuration
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

$activity_id = $_GET['activity_id'] ?? '';

if (empty($activity_id)) {
    echo json_encode(['success' => false, 'message' => 'Activity ID required']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $conn->prepare("
        SELECT * FROM activity_submission_files 
        WHERE activity_id = ? 
        ORDER BY uploaded_at DESC
    ");
    $stmt->execute([$activity_id]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'files' => $files]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>