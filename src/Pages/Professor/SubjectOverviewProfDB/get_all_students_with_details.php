<?php
// Professor/SubjectOverviewProfDB/get_all_students_with_details.php

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

// First, get class overview data to use the same calculation
// Since we can't use file_get_contents with HTTPS easily, let's replicate the logic
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
        'name' => $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
        'email' => $student['tracked_email'],
        'academic_percentage' => round($academic_percentage, 2),
        'attendance_percentage' => round($attendance_percentage, 2),
        'final_performance' => round($final_performance, 2)
    ];
    
    $total_class_percentage += $final_performance;
}

// Calculate overall class percentage
$overall_class_percentage = $total_students > 0 ? ($total_class_percentage / $total_students) : 0;

// Sort students by final performance (highest first for ranking)
usort($student_performances, function($a, $b) {
    return $b['final_performance'] <=> $a['final_performance'];
});

// Add ranking and status
$ranked_students = [];
foreach ($student_performances as $index => $student) {
    $performance = $student['final_performance'];
    
    // Determine status based on performance
    if ($performance >= 90) {
        $status = 'excellent';
    } elseif ($performance >= 75) {
        $status = 'good';
    } elseif ($performance >= 60) {
        $status = 'needs-improvement';
    } else {
        $status = 'at-risk';
    }
    
    $ranked_students[] = [
        'id' => $student['student_ID'],
        'name' => $student['name'],
        'email' => $student['email'],
        'average' => $performance,
        'status' => $status,
        'rank' => $index + 1,
        'academic_percentage' => $student['academic_percentage'],
        'attendance_percentage' => $student['attendance_percentage']
    ];
}

// Calculate class statistics
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

$class_stats = [
    "overallAverage" => round($overall_class_percentage, 2),
    "attendanceRate" => round($average_attendance, 2),
    "totalStudents" => $total_students,
    "atRiskStudents" => count($at_risk_students),
    "passedStudents" => count($passed_students),
    "failingStudents" => count($failing_students)
];

$response = [
    "success" => true,
    "students" => $ranked_students,
    "class_info" => $class_info,
    "class_stats" => $class_stats,
    "total_students" => count($ranked_students)
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