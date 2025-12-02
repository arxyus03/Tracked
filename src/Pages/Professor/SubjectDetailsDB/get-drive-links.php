<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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
    
    // Get links from activity_grades
    $stmt = $conn->prepare("
        SELECT student_ID as student_id, drive_link, drive_link_name as file_name, 
               drive_uploaded_at as uploaded_at
        FROM activity_grades 
        WHERE activity_ID = ? AND drive_link IS NOT NULL
        ORDER BY drive_uploaded_at DESC
    ");
    $stmt->execute([$activity_id]);
    
    $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'links' => $links]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>