<?php
// SubjectAnalyticsProfDB/fetch_class_averages.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

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

// Get parameters
$subjectCode = isset($_GET['code']) ? $_GET['code'] : '';
$activityType = isset($_GET['type']) ? $_GET['type'] : 'assignment';
$statusFilter = isset($_GET['status']) ? $_GET['status'] : 'All';

if (empty($subjectCode)) {
    echo json_encode(['error' => 'Subject code is required']);
    exit;
}

try {
    // Map activity types to match your database
    $activityTypeMap = [
        'assignment' => 'Assignment',
        'quiz' => 'Quiz',
        'activity' => 'Activity',
        'project' => 'Project',
        'laboratory' => 'Laboratory'
    ];
    
    $dbActivityType = $activityTypeMap[$activityType] ?? 'Assignment';
    
    // Get all activities of the specified type for this subject
    $activitiesSql = "SELECT 
                        a.id,
                        a.task_number,
                        a.title,
                        a.points,
                        a.deadline,
                        a.activity_type
                    FROM activities a
                    WHERE a.subject_code = :subject_code
                    AND a.activity_type = :activity_type
                    AND a.archived = 0
                    ORDER BY a.task_number, a.deadline";
    
    $activitiesStmt = $pdo->prepare($activitiesSql);
    $activitiesStmt->execute([
        ':subject_code' => $subjectCode,
        ':activity_type' => $dbActivityType
    ]);
    $activities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $responseData = [];
    
    foreach ($activities as $activity) {
        // Calculate class average for this activity
        $averageSql = "SELECT 
                        AVG(ag.grade) as class_average,
                        COUNT(ag.id) as submissions,
                        SUM(CASE WHEN ag.submitted = 1 THEN 1 ELSE 0 END) as submitted_count,
                        SUM(CASE WHEN ag.submitted = 0 OR ag.submitted IS NULL THEN 1 ELSE 0 END) as missed_count
                    FROM activity_grades ag
                    INNER JOIN student_classes sc ON ag.student_ID = sc.student_ID
                    WHERE ag.activity_ID = :activity_id
                    AND sc.subject_code = :subject_code
                    AND sc.archived = 0";
        
        $averageStmt = $pdo->prepare($averageSql);
        $averageStmt->execute([
            ':activity_id' => $activity['id'],
            ':subject_code' => $subjectCode
        ]);
        $averageResult = $averageStmt->fetch(PDO::FETCH_ASSOC);
        
        $classAverage = $averageResult['class_average'] ?? 0;
        
        // Apply status filter
        if ($statusFilter === 'Submitted') {
            if (($averageResult['submitted_count'] ?? 0) == 0) {
                continue;
            }
        } elseif ($statusFilter === 'Missed') {
            if (($averageResult['missed_count'] ?? 0) == 0) {
                continue;
            }
        }
        
        // Determine status
        $totalStudentsSql = "SELECT COUNT(*) as total FROM student_classes 
                            WHERE subject_code = :subject_code AND archived = 0";
        $totalStudentsStmt = $pdo->prepare($totalStudentsSql);
        $totalStudentsStmt->execute([':subject_code' => $subjectCode]);
        $totalStudents = $totalStudentsStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        
        $submittedStudents = $averageResult['submitted_count'] ?? 0;
        $status = 'Missed';
        if ($submittedStudents > 0) {
            $status = 'Submitted';
            if ($submittedStudents < $totalStudents) {
                $status = 'Partially Submitted';
            }
        }
        
        $responseData[] = [
            'id' => $activity['id'],
            'task' => $activity['title'] ?: $dbActivityType . ' ' . $activity['task_number'],
            'score' => round($classAverage, 2), // 2 decimal points
            'submitted' => $status === 'Submitted' || $status === 'Partially Submitted',
            'late' => false,
            'deadline' => $activity['deadline'],
            'status' => $status,
            'points' => $activity['points'] ?? 100,
            'submissions' => $averageResult['submissions'] ?? 0,
            'total_students' => $totalStudents
        ];
    }
    
    // Sort by task number if possible
    usort($responseData, function($a, $b) {
        $aNum = intval(preg_replace('/[^0-9]/', '', $a['task']));
        $bNum = intval(preg_replace('/[^0-9]/', '', $b['task']));
        return $aNum - $bNum;
    });
    
    echo json_encode([
        'success' => true,
        'activities' => $responseData,
        'activityType' => $activityType,
        'totalActivities' => count($responseData)
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Query failed: ' . $e->getMessage()]);
}
?>