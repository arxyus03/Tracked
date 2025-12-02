<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000'); // Your React app
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Local database config (XAMPP default)
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'tracked';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['student_id']) || !isset($data['drive_link'])) {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Save to activity_grades (simple)
    $stmt = $conn->prepare("
        UPDATE activity_grades 
        SET drive_link = ?, 
            drive_link_name = ?,
            drive_uploaded_at = NOW()
        WHERE activity_ID = ? AND student_ID = ?
    ");
    
    $success = $stmt->execute([
        $data['drive_link'],
        $data['file_name'] ?? 'Google Drive File',
        $data['activity_id'],
        $data['student_id']
    ]);

    // 2. Also save to activity_drive_links for history
    $historyStmt = $conn->prepare("
        INSERT INTO activity_drive_links 
        (activity_id, student_id, drive_link, file_name, uploaded_by)
        VALUES (?, ?, ?, ?, 'professor')
    ");
    
    $historyStmt->execute([
        $data['activity_id'],
        $data['student_id'],
        $data['drive_link'],
        $data['file_name'] ?? 'Google Drive File'
    ]);

    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Drive link saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save link']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>