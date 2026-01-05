<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Database configuration - USING YOUR SPECIFIED CREDENTIALS
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $student_id = $_GET['student_id'] ?? '';

    if (empty($student_id)) {
        echo json_encode(['success' => false, 'message' => 'Student ID is required']);
        exit;
    }
    
    // Get enrolled subjects
    $subjectQuery = "SELECT subject_code FROM student_classes WHERE student_ID = :student_id AND (archived = 0 OR archived IS NULL)";
    $subjectStmt = $conn->prepare($subjectQuery);
    $subjectStmt->bindParam(':student_id', $student_id);
    $subjectStmt->execute();
    $subjects = $subjectStmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($subjects)) {
        echo json_encode([
            'success' => true,
            'tasks_done' => 0,
            'total_tasks' => 0,
            'completion_percentage' => 0,
            'missed_activities' => 0,
            'active_activities' => 0
        ]);
        exit;
    }
    
    $placeholders = str_repeat('?,', count($subjects) - 1) . '?';
    
    // Count submitted tasks
    $submittedQuery = "
        SELECT COUNT(*) as count 
        FROM activities a
        WHERE a.subject_code IN ($placeholders)
        AND EXISTS (
            SELECT 1 FROM activity_grades ag 
            WHERE ag.activity_ID = a.id 
            AND ag.student_ID = ?
            AND ag.submitted = 1
        )
    ";
    
    $submittedStmt = $conn->prepare($submittedQuery);
    $params = array_merge($subjects, [$student_id]);
    for ($i = 1; $i <= count($params); $i++) {
        $submittedStmt->bindValue($i, $params[$i-1]);
    }
    $submittedStmt->execute();
    $submittedResult = $submittedStmt->fetch(PDO::FETCH_ASSOC);
    $tasks_done = $submittedResult['count'] ?? 0;
    
    // Count total tasks
    $totalQuery = "
        SELECT COUNT(*) as count 
        FROM activities a
        WHERE a.subject_code IN ($placeholders)
    ";
    
    $totalStmt = $conn->prepare($totalQuery);
    for ($i = 1; $i <= count($subjects); $i++) {
        $totalStmt->bindValue($i, $subjects[$i-1]);
    }
    $totalStmt->execute();
    $totalResult = $totalStmt->fetch(PDO::FETCH_ASSOC);
    $total_tasks = $totalResult['count'] ?? 0;
    
    // Calculate percentage
    $completion_percentage = $total_tasks > 0 ? round(($tasks_done / $total_tasks) * 100) : 0;
    
    // Count missed activities
    $missedQuery = "
        SELECT COUNT(*) as count 
        FROM activities a
        WHERE a.subject_code IN ($placeholders)
        AND a.deadline < NOW()
        AND NOT EXISTS (
            SELECT 1 FROM activity_grades ag 
            WHERE ag.activity_ID = a.id 
            AND ag.student_ID = ?
            AND ag.submitted = 1
        )
    ";
    
    $missedStmt = $conn->prepare($missedQuery);
    $missedParams = array_merge($subjects, [$student_id]);
    for ($i = 1; $i <= count($missedParams); $i++) {
        $missedStmt->bindValue($i, $missedParams[$i-1]);
    }
    $missedStmt->execute();
    $missedResult = $missedStmt->fetch(PDO::FETCH_ASSOC);
    $missed_activities = $missedResult['count'] ?? 0;
    
    // Count active activities
    $activeQuery = "
        SELECT COUNT(*) as count 
        FROM activities a
        WHERE a.subject_code IN ($placeholders)
        AND a.deadline >= NOW()
        AND NOT EXISTS (
            SELECT 1 FROM activity_grades ag 
            WHERE ag.activity_ID = a.id 
            AND ag.student_ID = ?
            AND ag.submitted = 1
        )
    ";
    
    $activeStmt = $conn->prepare($activeQuery);
    $activeParams = array_merge($subjects, [$student_id]);
    for ($i = 1; $i <= count($activeParams); $i++) {
        $activeStmt->bindValue($i, $activeParams[$i-1]);
    }
    $activeStmt->execute();
    $activeResult = $activeStmt->fetch(PDO::FETCH_ASSOC);
    $active_activities = $activeResult['count'] ?? 0;
    
    echo json_encode([
        'success' => true,
        'tasks_done' => $tasks_done,
        'total_tasks' => $total_tasks,
        'completion_percentage' => $completion_percentage,
        'missed_activities' => $missed_activities,
        'active_activities' => $active_activities
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>