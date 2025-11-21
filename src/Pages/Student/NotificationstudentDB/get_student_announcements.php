<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

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

if (empty($studentId)) {
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    // Get all classes the student is enrolled in
    $stmt = $pdo->prepare("
        SELECT sc.subject_code, c.subject, c.section, c.professor_ID
        FROM student_classes sc
        JOIN classes c ON sc.subject_code = c.subject_code
        WHERE sc.student_ID = ? AND sc.archived = 0
    ");
    $stmt->execute([$studentId]);
    $studentClasses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($studentClasses)) {
        echo json_encode(['success' => true, 'announcements' => []]);
        exit;
    }
    
    // Extract subject codes
    $subjectCodes = array_column($studentClasses, 'subject_code');
    
    // Create placeholders for the IN clause
    $placeholders = str_repeat('?,', count($subjectCodes) - 1) . '?';
    
    // Get announcements with professor information - FIXED field names and formatting
    $stmt = $pdo->prepare("
        SELECT 
            a.announcement_ID as id,
            c.subject as subject,
            a.title as title,
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as postedBy,
            DATE_FORMAT(a.created_at, '%M %e, %Y') as datePosted,
            CASE 
                WHEN a.deadline IS NOT NULL THEN 
                    CONCAT(DATE_FORMAT(a.deadline, '%M %e, %Y'), ' | ', DATE_FORMAT(a.deadline, '%l:%i%p'))
                ELSE NULL
            END as deadline,
            a.description as instructions,
            COALESCE(NULLIF(a.link, ''), '#') as link,
            c.section as section
        FROM announcements a
        JOIN classes c ON a.classroom_ID = c.subject_code
        JOIN tracked_users t ON a.professor_ID = t.tracked_ID
        WHERE a.classroom_ID IN ($placeholders)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute($subjectCodes);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug output to see what data is being returned
    error_log("Announcements data: " . json_encode($announcements));
    
    // Add isRead property
    foreach ($announcements as &$announcement) {
        $announcement['isRead'] = false;
    }
    
    echo json_encode([
        'success' => true,
        'announcements' => $announcements,
        'debug' => [
            'student_id' => $studentId,
            'classes_count' => count($studentClasses),
            'announcements_count' => count($announcements)
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