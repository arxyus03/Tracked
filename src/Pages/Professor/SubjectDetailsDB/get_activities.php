<?php
// C:\xampp\htdocs\TrackEd\src\Pages\Professor\SubjectDetailsDB\get_activities.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Localhost MySQL connection
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
    // Get class details
    $classStmt = $pdo->prepare("SELECT * FROM classes WHERE subject_code = ?");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$class) {
        echo json_encode(["success" => false, "message" => "Class not found for subject code: $subject_code"]);
        exit;
    }
    
    // Get enrolled students
    $studentsStmt = $pdo->prepare("
        SELECT 
            t.tracked_ID as user_ID, 
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name,
            t.tracked_Email as user_Email
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        WHERE sc.subject_code = ? AND sc.archived = 0
        AND t.tracked_Role = 'Student' AND t.tracked_Status = 'Active'
        ORDER BY t.tracked_lastname, t.tracked_firstname
    ");
    $studentsStmt->execute([$subject_code]);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get activities - only non-archived
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
        ORDER BY created_at ASC
    ");
    $stmt->execute([$subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each activity, get or create student grade entries
    foreach ($activities as &$activity) {
        $activityStudents = [];
        
        foreach ($students as $student) {
            // Check if grade entry exists
            $gradeStmt = $pdo->prepare("
                SELECT * FROM activity_grades 
                WHERE activity_ID = ? AND student_ID = ?
            ");
            $gradeStmt->execute([$activity['id'], $student['user_ID']]);
            $gradeData = $gradeStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($gradeData) {
                // Use existing grade data
                $activityStudents[] = [
                    'user_ID' => $student['user_ID'],
                    'user_Name' => $student['user_Name'],
                    'user_Email' => $student['user_Email'],
                    'grade' => $gradeData['grade'],
                    'submitted' => (bool)$gradeData['submitted'],
                    'late' => (bool)$gradeData['late'],
                    'submitted_at' => $gradeData['submitted_at']
                ];
            } else {
                // No grade entry exists yet
                $activityStudents[] = [
                    'user_ID' => $student['user_ID'],
                    'user_Name' => $student['user_Name'],
                    'user_Email' => $student['user_Email'],
                    'grade' => null,
                    'submitted' => false,
                    'late' => false,
                    'submitted_at' => null
                ];
            }
        }
        
        $activity['students'] = $activityStudents;
    }

    echo json_encode([
        "success" => true,
        "activities" => $activities,
        "students" => $students, // This is required for analytics
        "class_info" => $class,
        "debug" => [
            "total_students" => count($students),
            "total_activities" => count($activities),
            "subject_code" => $subject_code
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in get_activities.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Error fetching activities: " . $e->getMessage()
    ]);
}
?>