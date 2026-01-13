<?php
// Professor/SubjectOverviewProfDB/get_subject_activities.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Get parameters
$subject_code = $_GET['subject_code'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Missing subject code"]);
    exit;
}

// Get total number of students in the class
$total_students_query = "SELECT COUNT(*) as total 
                         FROM student_classes 
                         WHERE subject_code = :subject_code 
                         AND archived = 0";
$total_stmt = $pdo->prepare($total_students_query);
$total_stmt->execute(['subject_code' => $subject_code]);
$total_result = $total_stmt->fetch(PDO::FETCH_ASSOC);
$total_students = $total_result['total'] ?? 0;

// Get all activities for this subject
$activities_query = "SELECT a.*
                     FROM activities a
                     WHERE a.subject_code = :subject_code 
                     AND a.archived = 0
                     ORDER BY a.created_at DESC";
    
$activities_stmt = $pdo->prepare($activities_query);
$activities_stmt->execute(['subject_code' => $subject_code]);
$activities = $activities_stmt->fetchAll(PDO::FETCH_ASSOC);

// Process activities to determine status
$processed_activities = [];
$now = new DateTime();
$type_stats = [];

foreach ($activities as $activity) {
    $deadline = new DateTime($activity['deadline']);
    $created_at = new DateTime($activity['created_at']);
    
    // Get number of students who submitted this activity
    $submitted_query = "SELECT COUNT(*) as submitted_count 
                       FROM activity_grades 
                       WHERE activity_ID = :activity_id 
                       AND submitted = 1";
    $submitted_stmt = $pdo->prepare($submitted_query);
    $submitted_stmt->execute(['activity_id' => $activity['id']]);
    $submitted_result = $submitted_stmt->fetch(PDO::FETCH_ASSOC);
    $submitted_count = $submitted_result['submitted_count'] ?? 0;
    
    // Calculate submission percentage
    $submission_percentage = $total_students > 0 ? ($submitted_count / $total_students) * 100 : 0;
    
    // Determine status based on submission rate and deadline
    $status = 'assigned'; // Default status
    
    if ($now > $deadline) {
        // Deadline has passed
        if ($submission_percentage == 100) {
            $status = 'submitted'; // Green - all submitted
        } elseif ($submission_percentage >= 50) {
            $status = 'incomplete'; // Yellow - more than half submitted
        } else {
            $status = 'missed'; // Red - less than half submitted
        }
    } else {
        // Deadline hasn't passed yet
        if ($submission_percentage == 100) {
            $status = 'completed'; // Blue - all submitted before deadline
        } else {
            $status = 'assigned'; // Still assigned/ongoing
        }
    }
    
    // Collect type statistics
    $activity_type = $activity['activity_type'];
    if (!isset($type_stats[$activity_type])) {
        $type_stats[$activity_type] = 0;
    }
    $type_stats[$activity_type]++;
    
    $processed_activities[] = [
        'id' => $activity['id'],
        'subject_code' => $activity['subject_code'],
        'activity_type' => $activity['activity_type'],
        'task_number' => $activity['task_number'],
        'title' => $activity['title'],
        'instruction' => $activity['instruction'],
        'points' => $activity['points'],
        'deadline' => $activity['deadline'],
        'created_at' => $activity['created_at'],
        'updated_at' => $activity['updated_at'],
        'total_students' => $total_students,
        'submitted_count' => $submitted_count,
        'submission_percentage' => round($submission_percentage, 2),
        'status' => $status
    ];
}

// Calculate overall statistics
$total_activities = count($processed_activities);
$submitted_activities = array_filter($processed_activities, function($a) {
    return in_array($a['status'], ['submitted', 'completed']);
});
$assigned_activities = array_filter($processed_activities, function($a) {
    return $a['status'] === 'assigned';
});
$missed_activities = array_filter($processed_activities, function($a) {
    return $a['status'] === 'missed';
});
$incomplete_activities = array_filter($processed_activities, function($a) {
    return $a['status'] === 'incomplete';
});

$response = [
    "success" => true,
    "activities" => $processed_activities,
    "statistics" => [
        "total" => $total_activities,
        "submitted" => count($submitted_activities),
        "assigned" => count($assigned_activities),
        "missed" => count($missed_activities),
        "incomplete" => count($incomplete_activities),
        "type_distribution" => $type_stats
    ],
    "total_students" => $total_students
];

echo json_encode($response);
?>