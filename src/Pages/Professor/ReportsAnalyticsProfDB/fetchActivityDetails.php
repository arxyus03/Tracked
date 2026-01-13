<?php
// Professor/ReportsAnalyticsProfDB/fetchActivityDetails.php
header('Access-Control-Allow-Origin: https://tracked.6minds.site');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$subjectCode = $_GET['subject_code'] ?? null;
$weekNumber = $_GET['week'] ?? null;

if (!$subjectCode || !$weekNumber) {
    echo json_encode(['error' => 'Subject code and week are required']);
    exit;
}

// Parse subject code and section
$subjectParts = explode('-', $subjectCode);
$baseSubjectCode = $subjectParts[0];

// Get activities for this subject in the specified week
$sql = "
    SELECT 
        a.id as activity_id,
        a.activity_type,
        a.title,
        a.instruction,
        a.points as max_points,
        a.deadline,
        a.created_at,
        a.task_number,
        COUNT(ag.id) as total_submissions,
        AVG(ag.grade) as average_grade,
        MIN(ag.grade) as min_grade,
        MAX(ag.grade) as max_grade
    FROM activities a
    LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.submitted = 1
    WHERE a.subject_code = :subjectCode 
        AND a.archived = 0
        AND WEEK(a.deadline, 1) = :weekNumber
    GROUP BY a.id
    ORDER BY a.deadline
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':subjectCode' => $baseSubjectCode,
    ':weekNumber' => $weekNumber
]);

$activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get total number of students in this class
$studentSql = "
    SELECT COUNT(DISTINCT sc.student_ID) as total_students
    FROM student_classes sc
    WHERE sc.subject_code = :subjectCode 
        AND sc.archived = 0
";

$studentStmt = $pdo->prepare($studentSql);
$studentStmt->execute([':subjectCode' => $baseSubjectCode]);
$studentCount = $studentStmt->fetch(PDO::FETCH_ASSOC)['total_students'];

// Format the response
$response = [];
foreach ($activities as $activity) {
    $maxPoints = $activity['max_points'] ?: 100;
    $averagePercentage = $activity['average_grade'] ? 
        round(($activity['average_grade'] / $maxPoints) * 100, 2) : 0;
    $minPercentage = $activity['min_grade'] ? 
        round(($activity['min_grade'] / $maxPoints) * 100, 2) : 0;
    $maxPercentage = $activity['max_grade'] ? 
        round(($activity['max_grade'] / $maxPoints) * 100, 2) : 0;
    
    $response[] = [
        'activityId' => $activity['activity_id'],
        'title' => $activity['title'],
        'type' => $activity['activity_type'],
        'taskNumber' => $activity['task_number'],
        'maxPoints' => $maxPoints,
        'deadline' => $activity['deadline'],
        'createdAt' => $activity['created_at'],
        'totalSubmissions' => (int)$activity['total_submissions'],
        'totalStudents' => (int)$studentCount,
        'submissionRate' => $studentCount > 0 ? 
            round(($activity['total_submissions'] / $studentCount) * 100, 2) : 0,
        'averageGrade' => $averagePercentage,
        'minGrade' => $minPercentage,
        'maxGrade' => $maxPercentage,
        'performance' => getPerformanceLevel($averagePercentage)
    ];
}

echo json_encode($response);

function getPerformanceLevel($percentage) {
    if ($percentage < 71) return 'failing';
    if ($percentage >= 71 && $percentage <= 75) return 'warning';
    return 'good';
}
?>