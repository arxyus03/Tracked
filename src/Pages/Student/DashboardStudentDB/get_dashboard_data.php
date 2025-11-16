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
    
    // Get student ID from query parameter
    if (!isset($_GET['student_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Student ID is required'
        ]);
        exit;
    }
    
    $studentId = $_GET['student_id'];
    
    // 1. COMPLETED ACTIVITIES: Activities with submitted = 1 AND grade IS NOT NULL
    $completedStmt = $conn->prepare("
        SELECT COUNT(DISTINCT ag.activity_ID) as completed_count
        FROM activity_grades ag
        INNER JOIN activities a ON ag.activity_ID = a.id
        INNER JOIN student_classes sc ON a.subject_code = sc.subject_code
        WHERE ag.student_ID = ? 
        AND ag.submitted = 1 
        AND ag.grade IS NOT NULL
        AND sc.archived = 0
    ");
    $completedStmt->execute([$studentId]);
    $completedResult = $completedStmt->fetch(PDO::FETCH_ASSOC);
    $completedActivities = $completedResult['completed_count'] ?? 0;
    
    // 2. OVERALL SUBMITTED: All activities with submitted = 1 (regardless of grade)
    $submittedStmt = $conn->prepare("
        SELECT COUNT(DISTINCT ag.activity_ID) as submitted_count
        FROM activity_grades ag
        INNER JOIN activities a ON ag.activity_ID = a.id
        INNER JOIN student_classes sc ON a.subject_code = sc.subject_code
        WHERE ag.student_ID = ? 
        AND ag.submitted = 1
        AND sc.archived = 0
    ");
    $submittedStmt->execute([$studentId]);
    $submittedResult = $submittedStmt->fetch(PDO::FETCH_ASSOC);
    $overallSubmitted = $submittedResult['submitted_count'] ?? 0;
    
    // 3. OVERALL DAYS ABSENT: Count of 'absent' status in attendance
    $absentStmt = $conn->prepare("
        SELECT COUNT(*) as absent_count
        FROM attendance att
        INNER JOIN student_classes sc ON att.subject_code = sc.subject_code
        WHERE att.student_ID = ? 
        AND att.status = 'absent'
        AND sc.archived = 0
    ");
    $absentStmt->execute([$studentId]);
    $absentResult = $absentStmt->fetch(PDO::FETCH_ASSOC);
    $overallDaysAbsent = $absentResult['absent_count'] ?? 0;
    
    // 4. PENDING TASK: Activities not submitted AND deadline not passed
    $pendingStmt = $conn->prepare("
        SELECT COUNT(DISTINCT a.id) as pending_count
        FROM activities a
        INNER JOIN student_classes sc ON a.subject_code = sc.subject_code
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE sc.student_ID = ?
        AND sc.archived = 0
        AND (ag.submitted = 0 OR ag.submitted IS NULL)
        AND (a.deadline IS NULL OR a.deadline > NOW())
    ");
    $pendingStmt->execute([$studentId, $studentId]);
    $pendingResult = $pendingStmt->fetch(PDO::FETCH_ASSOC);
    $pendingTask = $pendingResult['pending_count'] ?? 0;
    
    // 5. TOTAL DAYS PRESENT: Count of 'present' status in attendance
    $presentStmt = $conn->prepare("
        SELECT COUNT(*) as present_count
        FROM attendance att
        INNER JOIN student_classes sc ON att.subject_code = sc.subject_code
        WHERE att.student_ID = ? 
        AND att.status = 'present'
        AND sc.archived = 0
    ");
    $presentStmt->execute([$studentId]);
    $presentResult = $presentStmt->fetch(PDO::FETCH_ASSOC);
    $totalDaysPresent = $presentResult['present_count'] ?? 0;
    
    // 6. OVERALL MISSED: Activities not submitted AND deadline passed
    $missedStmt = $conn->prepare("
        SELECT COUNT(DISTINCT a.id) as missed_count
        FROM activities a
        INNER JOIN student_classes sc ON a.subject_code = sc.subject_code
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE sc.student_ID = ?
        AND sc.archived = 0
        AND (ag.submitted = 0 OR ag.submitted IS NULL)
        AND a.deadline IS NOT NULL 
        AND a.deadline <= NOW()
    ");
    $missedStmt->execute([$studentId, $studentId]);
    $missedResult = $missedStmt->fetch(PDO::FETCH_ASSOC);
    $overallMissed = $missedResult['missed_count'] ?? 0;
    
    echo json_encode([
        'success' => true,
        'completed_activities' => (int)$completedActivities,
        'overall_submitted' => (int)$overallSubmitted,
        'overall_days_absent' => (int)$overallDaysAbsent,
        'pending_task' => (int)$pendingTask,
        'total_days_present' => (int)$totalDaysPresent,
        'overall_missed' => (int)$overallMissed
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn = null;
?>