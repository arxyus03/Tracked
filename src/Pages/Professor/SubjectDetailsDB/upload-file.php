<?php
header('Content-Type: application/json');

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
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

// Create uploads directory if it doesn't exist
$uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/TrackEd/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit();
}

// Get POST data
$activity_id = $_POST['activity_id'] ?? '';
$student_id = $_POST['student_id'] ?? '';
$file_type = $_POST['file_type'] ?? 'professor';

if (empty($activity_id) || empty($student_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing activity or student ID']);
    exit();
}

$file = $_FILES['file'];
$originalName = basename($file['name']);
$fileSize = $file['size'];
$fileTmpName = $file['tmp_name'];
$fileType = $file['type'];

// Generate unique filename to prevent collisions
$fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);
$safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
$uniqueFileName = time() . '_' . uniqid() . '_' . $safeFileName;
$uploadPath = $uploadDir . $uniqueFileName;

// Move uploaded file
if (move_uploaded_file($fileTmpName, $uploadPath)) {
    // File URL accessible from web
    $fileUrl = "http://localhost/TrackEd/uploads/" . $uniqueFileName;
    
    try {
        // Connect to database
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Save to activity_files table
        $stmt = $conn->prepare("
            INSERT INTO activity_files 
            (activity_id, student_id, file_name, original_name, file_url, file_size, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $activity_id,
            $student_id,
            $uniqueFileName,
            $originalName,
            $fileUrl,
            $fileSize,
            $fileType,
            $file_type
        ]);
        
        $fileId = $conn->lastInsertId();
        
        // Also update activity_grades table for quick access
        $updateStmt = $conn->prepare("
            UPDATE activity_grades 
            SET uploaded_file_url = ?, 
                uploaded_file_name = ?
            WHERE activity_ID = ? AND student_ID = ?
        ");
        
        $updateStmt->execute([
            $fileUrl,
            $originalName,
            $activity_id,
            $student_id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'file' => [
                'id' => $fileId,
                'original_name' => $originalName,
                'file_name' => $uniqueFileName,
                'url' => $fileUrl,
                'size' => $fileSize,
                'type' => $fileType,
                'uploaded_at' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (PDOException $e) {
        // Delete uploaded file if database error
        unlink($uploadPath);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>