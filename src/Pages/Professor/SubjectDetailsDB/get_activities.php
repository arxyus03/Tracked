<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Localhost MySQL connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

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
    
    // Get all enrolled students in the class (for reference only)
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
    $allStudents = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
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
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') as created_at,
            DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%sZ') as updated_at,
            archived,
            school_work_edited
        FROM activities 
        WHERE subject_code = ? AND (archived = 0 OR archived IS NULL) 
        ORDER BY created_at ASC
    ");
    $stmt->execute([$subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each activity, get ONLY students who are assigned to this activity
    foreach ($activities as &$activity) {
        $assignedStudents = [];
        
        // Get students who are assigned to this activity (from activity_grades table)
        $assignedStmt = $pdo->prepare("
            SELECT 
                ag.student_ID as user_ID,
                CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name,
                t.tracked_Email as user_Email,
                ag.grade,
                ag.submitted,
                ag.late,
                ag.submitted_at,
                ag.uploaded_file_url,
                ag.uploaded_file_name
            FROM activity_grades ag
            INNER JOIN tracked_users t ON ag.student_ID = t.tracked_ID
            WHERE ag.activity_ID = ?
            AND t.tracked_Role = 'Student' 
            AND t.tracked_Status = 'Active'
            ORDER BY t.tracked_lastname, t.tracked_firstname
        ");
        $assignedStmt->execute([$activity['id']]);
        $assignedStudents = $assignedStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform the data to match expected format
        $activityStudents = [];
        foreach ($assignedStudents as $student) {
            $activityStudents[] = [
                'user_ID' => $student['user_ID'],
                'user_Name' => $student['user_Name'],
                'user_Email' => $student['user_Email'],
                'grade' => $student['grade'],
                'submitted' => (bool)$student['submitted'],
                'late' => (bool)$student['late'],
                'submitted_at' => $student['submitted_at'],
                'uploaded_file_url' => $student['uploaded_file_url'],
                'uploaded_file_name' => $student['uploaded_file_name']
            ];
        }
        
        $activity['students'] = $activityStudents;
    }

    echo json_encode([
        "success" => true,
        "activities" => $activities,
        "all_students" => $allStudents, // This is now separate from activity students
        "class_info" => $class,
        "debug" => [
            "total_students_in_class" => count($allStudents),
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