<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Database configuration - USING YOUR SPECIFIED CREDENTIALS
$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Get student_id and subject_code from query parameters
$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : '';
$subject_code = isset($_GET['subject_code']) ? $_GET['subject_code'] : '';

// Validate input
if (empty($student_id) || empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

// Sanitize input
$student_id = $conn->real_escape_string($student_id);
$subject_code = $conn->real_escape_string($subject_code);

try {
    // Query to get grades for a specific student and subject
    // IMPORTANT: Use COALESCE to handle NULL points - default to 100
    $sql = "SELECT 
                a.id as activity_id,
                a.subject_code,
                a.activity_type,
                a.title,
                a.task_number,
                a.created_at,
                a.deadline,
                -- Handle NULL points by defaulting to 100
                COALESCE(a.points, 100) AS total_points,
                ag.grade AS earned_points,
                ag.submitted,
                ag.late,
                ag.submitted_at
            FROM activities a
            LEFT JOIN activity_grades ag ON a.id = ag.activity_ID 
                AND ag.student_ID = '$student_id'
            WHERE a.subject_code = '$subject_code'
            ORDER BY a.created_at DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $grades = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate percentage if we have both grade and points
        $percentage = null;
        if ($row['earned_points'] !== null && is_numeric($row['earned_points']) && 
            $row['total_points'] > 0) {
            $percentage = round(($row['earned_points'] / $row['total_points']) * 100, 2);
        }
        
        $grades[] = [
            'activity_id' => $row['activity_id'],
            'subject_code' => $row['subject_code'],
            'activity_type' => $row['activity_type'],
            'title' => $row['title'],
            'task_number' => $row['task_number'],
            'created_at' => $row['created_at'],
            'deadline' => $row['deadline'],
            'points' => $row['total_points'],  // This now uses COALESCE value
            'grade' => $row['earned_points'],
            'percentage' => $percentage,  // Pre-calculated percentage
            'submitted' => $row['submitted'],
            'late' => $row['late'],
            'submitted_at' => $row['submitted_at']
        ];
    }
    
    // Calculate overall statistics
    $total_points_possible = 0;
    $total_points_earned = 0;
    $graded_activities = 0;
    $total_activities = count($grades);
    
    foreach ($grades as $grade) {
        if (is_numeric($grade['grade']) && $grade['grade'] !== null && 
            is_numeric($grade['points']) && $grade['points'] > 0) {
            
            $total_points_possible += floatval($grade['points']);
            $total_points_earned += floatval($grade['grade']);
            $graded_activities++;
        }
    }
    
    // Calculate overall percentage
    $overall_percentage = 0;
    if ($total_points_possible > 0) {
        $overall_percentage = round(($total_points_earned / $total_points_possible) * 100);
    }
    
    echo json_encode([
        "success" => true,
        "grades" => $grades,
        "statistics" => [
            "total_activities" => $total_activities,
            "graded_activities" => $graded_activities,
            "total_points_possible" => $total_points_possible,
            "total_points_earned" => $total_points_earned,
            "overall_percentage" => $overall_percentage
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>