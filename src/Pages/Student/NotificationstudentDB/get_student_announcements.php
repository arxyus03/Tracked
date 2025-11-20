<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

// Create connection
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get student ID from request
$studentId = $_POST['student_id'] ?? '';

// Debug logging
error_log("Received student ID: " . $studentId);

if (empty($studentId)) {
    error_log("Student ID is empty");
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    // Get all classes the student is enrolled in
    $stmt = $pdo->prepare("
        SELECT subject_code 
        FROM student_classes 
        WHERE student_ID = ? AND archived = 0
    ");
    $stmt->execute([$studentId]);
    $studentClasses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Found " . count($studentClasses) . " classes for student: " . $studentId);
    
    if (empty($studentClasses)) {
        error_log("No classes found for student");
        echo json_encode(['success' => true, 'announcements' => []]);
        exit;
    }
    
    // Extract subject codes
    $subjectCodes = array_column($studentClasses, 'subject_code');
    error_log("Subject codes: " . implode(', ', $subjectCodes));
    
    // Create placeholders for the IN clause
    $placeholders = str_repeat('?,', count($subjectCodes) - 1) . '?';
    
    // Get announcements for these classes - FIXED: removed user name fields
    $stmt = $pdo->prepare("
        SELECT 
            a.announcement_ID,
            a.professor_ID,
            a.classroom_ID,
            a.title,
            a.description,
            a.link,
            a.deadline,
            a.created_at,
            a.updated_at
        FROM announcements a
        WHERE a.classroom_ID IN ($placeholders)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute($subjectCodes);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Found " . count($announcements) . " announcements");
    
    // Add isRead property
    foreach ($announcements as &$announcement) {
        $announcement['isRead'] = false;
    }
    
    echo json_encode([
        'success' => true,
        'announcements' => $announcements,
        'debug_info' => [
            'student_id' => $studentId,
            'classes_count' => count($studentClasses),
            'announcements_count' => count($announcements),
            'subject_codes' => $subjectCodes
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>