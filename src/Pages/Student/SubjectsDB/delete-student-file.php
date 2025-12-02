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
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['file_id'])) {
    echo json_encode(['success' => false, 'message' => 'File ID required']);
    exit();
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get file info before deleting
    $stmt = $conn->prepare("SELECT file_name FROM activity_files WHERE id = ?");
    $stmt->execute([$data['file_id']]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($file) {
        // Delete file from uploads directory
        $filePath = $_SERVER['DOCUMENT_ROOT'] . '/TrackEd/uploads/' . $file['file_name'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete from database
        $deleteStmt = $conn->prepare("DELETE FROM activity_files WHERE id = ?");
        $deleteStmt->execute([$data['file_id']]);
        
        echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'File not found']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>