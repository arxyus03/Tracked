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

$activity_id = $_GET['activity_id'] ?? '';

if (empty($activity_id)) {
    echo json_encode(["success" => false, "message" => "Activity ID is required"]);
    exit;
}

try {
    // Get activity details
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
        WHERE id = ?
    ");
    $stmt->execute([$activity_id]);
    $activity = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$activity) {
        echo json_encode(["success" => false, "message" => "Activity not found"]);
        exit;
    }

    // Get students who are assigned to this activity (from activity_grades table)
    $studentsStmt = $pdo->prepare("
        SELECT 
            ag.student_ID,
            tu.tracked_firstname,
            tu.tracked_lastname,
            tu.tracked_email,
            CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as user_Name,
            ag.grade,
            ag.submitted,
            ag.late,
            ag.submitted_at,
            ag.uploaded_file_url,
            ag.uploaded_file_name
        FROM activity_grades ag
        INNER JOIN tracked_users tu ON ag.student_ID = tu.tracked_ID
        WHERE ag.activity_ID = ?
        AND tu.tracked_Role = 'Student'
        AND tu.tracked_Status = 'Active'
        ORDER BY tu.tracked_lastname, tu.tracked_firstname
    ");
    $studentsStmt->execute([$activity_id]);
    $assignedStudents = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Transform student data to match expected format
    $transformedStudents = array_map(function($student) {
        return [
            'user_ID' => $student['student_ID'],
            'user_Name' => $student['user_Name'],
            'user_Email' => $student['tracked_email'],
            'tracked_firstname' => $student['tracked_firstname'],
            'tracked_lastname' => $student['tracked_lastname'],
            'tracked_email' => $student['tracked_email'],
            'grade' => $student['grade'],
            'submitted' => (bool)$student['submitted'],
            'late' => (bool)$student['late'],
            'submitted_at' => $student['submitted_at'],
            'uploaded_file_url' => $student['uploaded_file_url'],
            'uploaded_file_name' => $student['uploaded_file_name']
        ];
    }, $assignedStudents);

    // Get uploaded files for this activity
    $filesStmt = $pdo->prepare("
        SELECT 
            af.*,
            af.original_name as file_name,
            af.file_url as url
        FROM activity_files af
        WHERE af.activity_id = ?
        ORDER BY af.uploaded_at DESC
    ");
    $filesStmt->execute([$activity_id]);
    $files = $filesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Organize files by uploader
    $professorFiles = array_filter($files, function($file) {
        return $file['uploaded_by'] === 'professor';
    });
    
    $studentFiles = array_filter($files, function($file) {
        return $file['uploaded_by'] === 'student';
    });

    echo json_encode([
        "success" => true,
        "activity" => $activity,
        "students" => $transformedStudents,
        "assign_to" => count($assignedStudents) > 0 ? 'individual' : 'wholeClass', // This assumes individual if there are students
        "professor_files" => array_values($professorFiles),
        "student_files" => array_values($studentFiles),
        "total_assigned_students" => count($assignedStudents)
    ]);

} catch (Exception $e) {
    error_log("Error in get_activity_details.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Error fetching activity details: " . $e->getMessage()
    ]);
}
?>