<?php
// Professor/SubjectOverviewProfDB/get_student_detailed_info.php

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
$student_id = $_GET['student_id'] ?? '';
$subject_code = $_GET['subject_code'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (empty($student_id) || empty($subject_code) || empty($professor_ID)) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

// Get student info
$student_query = "SELECT tracked_firstname, tracked_lastname, tracked_email 
                  FROM tracked_users 
                  WHERE tracked_ID = :student_id";
$student_stmt = $pdo->prepare($student_query);
$student_stmt->execute(['student_id' => $student_id]);
$student_info = $student_stmt->fetch(PDO::FETCH_ASSOC);

if (!$student_info) {
    echo json_encode(["success" => false, "message" => "Student not found"]);
    exit;
}

// Calculate attendance details
$attendance_query = "SELECT 
                     COUNT(*) as total_classes,
                     SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                     SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                     SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count
                     FROM attendance 
                     WHERE student_ID = :student_id 
                     AND subject_code = :subject_code 
                     AND professor_ID = :professor_ID";
$attendance_stmt = $pdo->prepare($attendance_query);
$attendance_stmt->execute([
    'student_id' => $student_id,
    'subject_code' => $subject_code,
    'professor_ID' => $professor_ID
]);
$attendance = $attendance_stmt->fetch(PDO::FETCH_ASSOC);

// Calculate attendance percentage using your formula
$total_classes = $attendance['total_classes'] ?? 0;
$present_points = ($attendance['present_count'] ?? 0) * 100;
$late_points = ($attendance['late_count'] ?? 0) * 50;
$absent_points = ($attendance['absent_count'] ?? 0) * 0;

$total_points = $present_points + $late_points + $absent_points;
$total_possible_points = $total_classes * 100;
$attendance_percentage = $total_possible_points > 0 ? ($total_points / $total_possible_points) * 100 : 100;

// Get all activities and grades for this student
$activities_query = "SELECT a.id, a.activity_type, a.task_number, a.title, a.points, a.deadline,
                     ag.grade, ag.submitted, ag.submitted_at, ag.late
                     FROM activities a
                     LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = :student_id
                     WHERE a.subject_code = :subject_code 
                     AND a.archived = 0
                     ORDER BY a.deadline DESC";
$activities_stmt = $pdo->prepare($activities_query);
$activities_stmt->execute(['student_id' => $student_id, 'subject_code' => $subject_code]);
$activities = $activities_stmt->fetchAll(PDO::FETCH_ASSOC);

// Process activities
$processed_activities = [];
$total_academic_score = 0;
$total_possible_academic_score = 0;

foreach ($activities as $activity) {
    $grade = $activity['grade'] ? floatval($activity['grade']) : 0;
    $max_points = $activity['points'] ? floatval($activity['points']) : 100;
    
    // Calculate activity percentage
    $activity_percentage = $max_points > 0 ? ($grade / $max_points) * 100 : 0;
    
    // Determine activity status
    if ($activity['submitted']) {
        if ($activity['late']) {
            $status = 'Late';
        } else {
            $status = 'Submitted';
        }
    } else {
        $deadline = new DateTime($activity['deadline']);
        $now = new DateTime();
        $status = $now > $deadline ? 'Missed' : 'Assigned';
    }
    
    $processed_activities[] = [
        'id' => $activity['id'],
        'title' => $activity['title'],
        'type' => $activity['activity_type'],
        'dueDate' => $activity['deadline'],
        'grade' => $grade > 0 ? $grade . '/' . $max_points : 'Not graded',
        'maxPoints' => $max_points,
        'status' => $status,
        'submitted' => $activity['submitted'] == 1,
        'late' => $activity['late'] == 1,
        'activity_percentage' => $activity_percentage
    ];
    
    // Add to academic calculation if graded
    if ($grade > 0) {
        $total_academic_score += $activity_percentage;
        $total_possible_academic_score += 100;
    }
}

// Calculate academic percentage
$academic_percentage = $total_possible_academic_score > 0 ? 
    ($total_academic_score / $total_possible_academic_score) * 100 : 0;

// Calculate final performance
$final_performance = ($academic_percentage * 0.75) + ($attendance_percentage * 0.25);

// Calculate activity statistics
$activity_stats = [
    'total' => count($processed_activities),
    'submitted' => count(array_filter($processed_activities, function($a) { return $a['submitted']; })),
    'missed' => count(array_filter($processed_activities, function($a) { return $a['status'] === 'Missed'; })),
    'assigned' => count(array_filter($processed_activities, function($a) { return $a['status'] === 'Assigned'; }))
];

$response = [
    "success" => true,
    "details" => [
        "student_info" => $student_info,
        "attendance" => [
            "rate" => round($attendance_percentage, 2),
            "absences" => $attendance['absent_count'] ?? 0,
            "lates" => $attendance['late_count'] ?? 0,
            "present" => $attendance['present_count'] ?? 0,
            "totalClasses" => $total_classes
        ],
        "academic_percentage" => round($academic_percentage, 2),
        "final_performance" => round($final_performance, 2),
        "activities" => $processed_activities,
        "activity_stats" => $activity_stats
    ]
];

echo json_encode($response);
?>