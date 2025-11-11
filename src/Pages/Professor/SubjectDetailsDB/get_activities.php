<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$subject_code = $_GET['subject_code'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject code is required"]);
    exit;
}

try {
    // First, get the class details including section
    $classStmt = $pdo->prepare("SELECT section, year_level FROM classes WHERE subject_code = ?");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$class) {
        echo json_encode(["success" => false, "message" => "Class not found"]);
        exit;
    }
    
    $section = $class['section'];
    
    // Get students who are actually ENROLLED in this class from tracked_users table
    $studentsStmt = $pdo->prepare("
        SELECT t.tracked_ID as user_ID, 
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        WHERE sc.subject_code = ? AND sc.archived = 0
        AND t.tracked_Role = 'Student' AND t.tracked_Status = 'Active'
    ");
    $studentsStmt->execute([$subject_code]);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("ENROLLED Students for class '$subject_code': " . count($students));
    
    // Get activities - ONLY NON-ARCHIVED activities (archived = 0 or NULL)
    // Format deadline to include time for frontend display
    $stmt = $pdo->prepare("
        SELECT 
            id,
            subject_code,
            professor_ID,
            activity_type,
            task_number,
            title,
            instruction,
            link,
            points,
            DATE_FORMAT(deadline, '%Y-%m-%d %H:%i:%s') as deadline,
            created_at,
            updated_at,
            archived,
            school_work_edited
        FROM activities 
        WHERE subject_code = ? AND (archived = 0 OR archived IS NULL) 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each activity, get or create student grade entries
    foreach ($activities as &$activity) {
        $activityStudents = [];
        
        foreach ($students as $student) {
            // Check if grade entry exists for this student and activity
            $gradeStmt = $pdo->prepare("
                SELECT * FROM activity_grades 
                WHERE activity_ID = ? AND student_ID = ?
            ");
            $gradeStmt->execute([$activity['id'], $student['user_ID']]);
            $gradeData = $gradeStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($gradeData) {
                // Use existing grade data - include submitted_at
                $activityStudents[] = [
                    'user_ID' => $student['user_ID'],
                    'user_Name' => $student['user_Name'],
                    'grade' => $gradeData['grade'],
                    'submitted' => (bool)$gradeData['submitted'],
                    'late' => (bool)$gradeData['late'],
                    'submitted_at' => $gradeData['submitted_at'] // Include submitted_at in response
                ];
            } else {
                // Create default entry if doesn't exist
                try {
                    $insertStmt = $pdo->prepare("
                        INSERT INTO activity_grades (activity_ID, student_ID, grade, submitted, late, submitted_at) 
                        VALUES (?, ?, NULL, 0, 0, NULL)
                    ");
                    $insertStmt->execute([$activity['id'], $student['user_ID']]);
                    
                    $activityStudents[] = [
                        'user_ID' => $student['user_ID'],
                        'user_Name' => $student['user_Name'],
                        'grade' => null,
                        'submitted' => false,
                        'late' => false,
                        'submitted_at' => null // Include submitted_at in response
                    ];
                } catch (Exception $insertError) {
                    error_log("Error inserting grade for student {$student['user_ID']}: " . $insertError->getMessage());
                    // Continue with other students even if one fails
                    continue;
                }
            }
        }
        
        $activity['students'] = $activityStudents;
    }

    echo json_encode([
        "success" => true,
        "activities" => $activities,
        "debug" => [
            "class_section" => $section,
            "total_enrolled_students" => count($students),
            "student_details" => $students,
            "total_activities" => count($activities)
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching activities: " . $e->getMessage()]);
}
?>