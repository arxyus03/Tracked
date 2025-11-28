<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set database connection to UTC timezone
    $pdo->exec("SET time_zone = '+00:00'");
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$subject_code = $_GET['subject_code'] ?? '';
$student_id = $_GET['student_id'] ?? '';

if (empty($subject_code) || empty($student_id)) {
    echo json_encode(["success" => false, "message" => "Subject code and Student ID are required"]);
    exit;
}

try {
    // Check if student is enrolled in this class
    $enrollmentStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ?");
    $enrollmentStmt->execute([$student_id, $subject_code]);
    $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$enrollment) {
        echo json_encode(["success" => false, "message" => "Student not enrolled in this class"]);
        exit;
    }

    // Get activities for this subject with UTC formatted timestamps and missing status
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.subject_code,
            a.activity_type,
            a.task_number,
            a.title,
            a.instruction,
            a.link,
            a.points,
            DATE_FORMAT(a.deadline, '%Y-%m-%dT%H:%i:%sZ') as deadline,
            DATE_FORMAT(a.created_at, '%Y-%m-%dT%H:%i:%sZ') as created_at,
            DATE_FORMAT(a.updated_at, '%Y-%m-%dT%H:%i:%sZ') as updated_at,
            COALESCE(ag.submitted, 0) as submitted,
            DATE_FORMAT(ag.submitted_at, '%Y-%m-%dT%H:%i:%sZ') as submitted_at,
            CASE 
                WHEN COALESCE(ag.submitted, 0) = 0 AND a.deadline IS NOT NULL AND a.deadline < UTC_TIMESTAMP() THEN 1
                ELSE 0
            END as missing
        FROM activities a 
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code = ? AND (a.archived = 0 OR a.archived IS NULL)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$student_id, $subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "activities" => $activities
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching activities: " . $e->getMessage()]);
}
?>