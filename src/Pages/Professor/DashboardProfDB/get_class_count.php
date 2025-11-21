<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user ID from query parameter
    if (!isset($_GET['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    $userId = $_GET['id'];
    
    // Fetch user data from tracked_users table - INCLUDING temporary_password
    $stmt = $conn->prepare("
        SELECT 
            tracked_ID,
            tracked_Role,
            tracked_email,
            tracked_firstname,
            tracked_lastname,
            tracked_middlename,
            tracked_semester,
            tracked_program,
            tracked_yearandsec,
            tracked_bday,
            tracked_gender,
            tracked_phone,
            tracked_Status,
            temporary_password,
            created_at,
            updated_at
        FROM tracked_users 
        WHERE tracked_ID = :id
    ");
    
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Fetch handled subjects for this professor (only active classes) with subject code
        $subjectStmt = $conn->prepare("
            SELECT subject, subject_code 
            FROM classes 
            WHERE professor_ID = :id 
            AND status = 'Active'
            ORDER BY created_at DESC
        ");
        
        $subjectStmt->bindParam(':id', $userId);
        $subjectStmt->execute();
        
        $subjects = $subjectStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format subjects as "Subject - Subject Code"
        $handledSubjects = [];
        foreach ($subjects as $subject) {
            $subjectName = $subject['subject'] ?? '';
            $subjectCode = $subject['subject_code'] ?? '';
            
            if (!empty($subjectName)) {
                if (!empty($subjectCode)) {
                    $handledSubjects[] = $subjectName . ' - ' . $subjectCode;
                } else {
                    $handledSubjects[] = $subjectName;
                }
            }
        }
        
        // Add handled subjects to user data
        $user['handled_subjects'] = $handledSubjects;
        $user['handled_subjects_count'] = count($handledSubjects);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>