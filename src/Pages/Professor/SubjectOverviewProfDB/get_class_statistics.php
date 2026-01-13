<?php
// Professor/SubjectOverviewProfDB/get_class_statistics.php

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

if (empty($subject_code) || empty($professor_ID)) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

// Replicate the logic from get_class_overview_data.php
$class_query = "SELECT * FROM classes WHERE subject_code = :subject_code AND professor_ID = :professor_ID";
$class_stmt = $pdo->prepare($class_query);
$class_stmt->execute(['subject_code' => $subject_code, 'professor_ID' => $professor_ID]);
$class_info = $class_stmt->fetch(PDO::FETCH_ASSOC);

if (!$class_info) {
    echo json_encode(["success" => false, "message" => "Class not found"]);
    exit;
}

// Get all students in this class
$students_query = "SELECT sc.student_ID, tu.tracked_firstname, tu.tracked_lastname, tu.tracked_email 
                   FROM student_classes sc 
                   JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID 
                   WHERE sc.subject_code = :subject_code 
                   AND sc.archived = 0";
$students_stmt = $pdo->prepare($students_query);
$students_stmt->execute(['subject_code' => $subject_code]);
$students = $students_stmt->fetchAll(PDO::FETCH_ASSOC);

$total_class_percentage = 0;
$total_students = count($students);
$student_performances = [];

foreach ($students as $student) {
    $student_ID = $student['student_ID'];
    
    // 1. Calculate Academic Percentage (75% weight)
    $academic_percentage = calculateAcademicPercentage($pdo, $student_ID, $subject_code);
    
    // 2. Calculate Attendance Percentage (25% weight)
    $attendance_percentage = calculateAttendancePercentage($pdo, $student_ID, $subject_code, $professor_ID);
    
    // 3. Calculate Final Current Performance
    $final_performance = ($academic_percentage * 0.75) + ($attendance_percentage * 0.25);
    
    $student_performances[] = [
        'student_ID' => $student_ID,
        'final_performance' => $final_performance,
        'attendance_percentage' => $attendance_percentage
    ];
    
    $total_class_percentage += $final_performance;
}

// Calculate overall class percentage
$overall_class_percentage = $total_students > 0 ? ($total_class_percentage / $total_students) : 0;

// Determine class status based on overall percentage
if ($overall_class_percentage >= 80) {
    $class_status = "Excellent";
    $status_color = "#00A15D";
    $bg_color = "#00A15D/20";
} elseif ($overall_class_percentage >= 70) {
    $class_status = "Good";
    $status_color = "#FFA600";
    $bg_color = "#FFA600/20";
} else {
    $class_status = "Needs Attention";
    $status_color = "#A15353";
    $bg_color = "#A15353/20";
}

// Calculate additional statistics
$passed_students = array_filter($student_performances, function($student) {
    return $student['final_performance'] >= 60;
});
$failing_students = array_filter($student_performances, function($student) {
    return $student['final_performance'] < 60;
});
$at_risk_students = array_filter($student_performances, function($student) {
    return $student['final_performance'] < 70 && $student['final_performance'] >= 60;
});

// Calculate average attendance rate
$average_attendance = $total_students > 0 ? 
    array_sum(array_column($student_performances, 'attendance_percentage')) / $total_students : 0;

// Return the statistics
$response = [
    "success" => true,
    "stats" => [
        "overallAverage" => round($overall_class_percentage, 2),
        "attendanceRate" => round($average_attendance, 2),
        "totalStudents" => $total_students,
        "atRiskStudents" => count($at_risk_students),
        "passedStudents" => count($passed_students),
        "failingStudents" => count($failing_students)
    ],
    "class_status" => [
        "status" => $class_status,
        "color" => $status_color,
        "bgColor" => $bg_color
    ]
];

echo json_encode($response);

// Function to calculate academic percentage
function calculateAcademicPercentage($pdo, $student_ID, $subject_code) {
    // Get all graded activities for this student in this subject
    $query = "SELECT ag.grade, a.points 
              FROM activity_grades ag 
              JOIN activities a ON ag.activity_ID = a.id 
              WHERE ag.student_ID = :student_ID 
              AND a.subject_code = :subject_code 
              AND ag.submitted = 1 
              AND ag.grade IS NOT NULL
              AND a.archived = 0";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(['student_ID' => $student_ID, 'subject_code' => $subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($activities)) {
        return 0;
    }
    
    $total_actual_score = 0;
    $total_possible_score = 0;
    
    foreach ($activities as $activity) {
        $grade = floatval($activity['grade']);
        $max_points = floatval($activity['points']) ?: 100;
        
        // Calculate percentage for this activity
        $activity_percentage = ($grade / $max_points) * 100;
        
        // Normalize to 100% scale (since all activities are weighted equally)
        $normalized_percentage = $activity_percentage;
        
        $total_actual_score += $normalized_percentage;
        $total_possible_score += 100; // Each activity contributes max 100%
    }
    
    return $total_possible_score > 0 ? ($total_actual_score / $total_possible_score) * 100 : 0;
}

// Function to calculate attendance percentage
function calculateAttendancePercentage($pdo, $student_ID, $subject_code, $professor_ID) {
    // Get all attendance records for this student in this subject
    $query = "SELECT status FROM attendance 
              WHERE student_ID = :student_ID 
              AND subject_code = :subject_code 
              AND professor_ID = :professor_ID";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        'student_ID' => $student_ID, 
        'subject_code' => $subject_code,
        'professor_ID' => $professor_ID
    ]);
    $attendance_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($attendance_records)) {
        return 100; // Default to 100% if no attendance records
    }
    
    $total_points = 0;
    $total_possible_points = 0;
    
    foreach ($attendance_records as $record) {
        $status = $record['status'];
        
        // Assign points based on status
        if ($status === 'present') {
            $points = 100;
        } elseif ($status === 'late') {
            $points = 50;
        } else { // absent
            $points = 0;
        }
        
        $total_points += $points;
        $total_possible_points += 100; // Each day contributes max 100 points
    }
    
    return $total_possible_points > 0 ? ($total_points / $total_possible_points) * 100 : 0;
}
?>