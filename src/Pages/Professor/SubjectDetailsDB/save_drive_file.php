<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration - UPDATE THESE VALUES FOR YOUR SETUP
$host = 'localhost';
$username = 'your_username'; // Change this
$password = 'your_password'; // Change this
$dbname = 'tracked'; // Your database name

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit();
}

$required_fields = ['activity_id', 'student_id', 'file_id', 'file_name', 'file_url'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
        exit();
    }
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if file already exists for this student and activity
    $checkStmt = $conn->prepare("SELECT id FROM activity_submission_files WHERE activity_id = ? AND student_id = ? AND file_id = ?");
    $checkStmt->execute([$data['activity_id'], $data['student_id'], $data['file_id']]);
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing file
        $stmt = $conn->prepare("
            UPDATE activity_submission_files 
            SET file_name = ?, file_url = ?, file_size = ?, mime_type = ?, 
                uploaded_by = ?, uploaded_at = ?, updated_at = NOW()
            WHERE activity_id = ? AND student_id = ? AND file_id = ?
        ");
        
        $stmt->execute([
            $data['file_name'],
            $data['file_url'],
            $data['file_size'] ?? null,
            $data['mime_type'] ?? null,
            $data['uploaded_by'] ?? 'professor',
            $data['uploaded_at'] ?? date('Y-m-d H:i:s'),
            $data['activity_id'],
            $data['student_id'],
            $data['file_id']
        ]);
    } else {
        // Insert new file
        $stmt = $conn->prepare("
            INSERT INTO activity_submission_files 
            (activity_id, student_id, file_id, file_name, file_url, file_size, mime_type, uploaded_by, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['activity_id'],
            $data['student_id'],
            $data['file_id'],
            $data['file_name'],
            $data['file_url'],
            $data['file_size'] ?? null,
            $data['mime_type'] ?? null,
            $data['uploaded_by'] ?? 'professor',
            $data['uploaded_at'] ?? date('Y-m-d H:i:s')
        ]);
    }

    // Also update activity_grades table if it exists
    try {
        $updateGradeStmt = $conn->prepare("
            UPDATE activity_grades 
            SET submitted_file_id = ?, submitted_file_url = ?, 
                submitted_file_name = ?, submitted_file_size = ?
            WHERE activity_ID = ? AND student_ID = ?
        ");
        $updateGradeStmt->execute([
            $data['file_id'],
            $data['file_url'],
            $data['file_name'],
            $data['file_size'] ?? null,
            $data['activity_id'],
            $data['student_id']
        ]);
    } catch (Exception $e) {
        // Table might not have these columns yet, ignore error
        error_log("Note: activity_grades table doesn't have file columns yet: " . $e->getMessage());
    }

    echo json_encode(['success' => true, 'message' => 'File saved successfully']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn = null;
?>