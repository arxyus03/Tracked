<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database configuration
$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Get parameters
$student_id = $_GET['student_id'] ?? '';
$subject_code = $_GET['subject_code'] ?? '';

if (empty($student_id) || empty($subject_code)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit();
}

try {
    // Get all activities for this subject
    $activityQuery = "
        SELECT 
            a.id,
            a.subject_code,
            a.activity_type,
            a.task_number,
            a.title,
            a.points,
            a.deadline,
            a.archived,
            ag.grade,
            ag.submitted,
            ag.submitted_at,
            ag.late
        FROM activities a
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code = ? AND a.archived = 0
        ORDER BY a.deadline ASC
    ";
    
    $stmt = $conn->prepare($activityQuery);
    $stmt->bind_param("ss", $student_id, $subject_code);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $allActivities = [];
    $passed = [];
    $lowGrade = [];
    $failed = [];
    $missed = [];
    $pending = [];
    
    $currentDate = date('Y-m-d H:i:s');
    
    while ($row = $result->fetch_assoc()) {
        $activity = [
            'id' => $row['id'],
            'subject_code' => $row['subject_code'],
            'activity_type' => $row['activity_type'],
            'task_number' => $row['task_number'],
            'title' => $row['title'],
            'points' => (int)$row['points'],
            'deadline' => $row['deadline'],
            'grade' => $row['grade'] !== null ? (float)$row['grade'] : null,
            'submitted' => (bool)$row['submitted'],
            'submitted_at' => $row['submitted_at'],
            'late' => (bool)$row['late'],
            'archived' => (bool)$row['archived']
        ];
        
        // Calculate percentage if grade exists
        $percentage = null;
        if ($activity['grade'] !== null && $activity['points'] > 0) {
            $percentage = ($activity['grade'] / $activity['points']) * 100;
        }
        
        // Check if past deadline
        $isPastDeadline = $activity['deadline'] && strtotime($activity['deadline']) < strtotime($currentDate);
        
        // Determine activity status based on new criteria
        if ($activity['grade'] !== null) {
            // Has grade
            if ($percentage >= 80) {
                $activity['status'] = 'passed';
                $activity['status_color'] = '#00A15D';
                $passed[] = $activity;
            } else if ($percentage >= 75) {
                $activity['status'] = 'low';
                $activity['status_color'] = '#FFA600';
                $lowGrade[] = $activity;
            } else {
                $activity['status'] = 'failed';
                $activity['status_color'] = '#A15353';
                $failed[] = $activity;
            }
        } else {
            // No grade yet
            if ($activity['submitted']) {
                $activity['status'] = 'pending';
                $activity['status_color'] = '#767EE0';
                $pending[] = $activity;
            } else if ($isPastDeadline) {
                $activity['status'] = 'missed';
                $activity['status_color'] = '#A15353';
                $missed[] = $activity;
            } else {
                $activity['status'] = 'pending';
                $activity['status_color'] = '#767EE0';
                $pending[] = $activity;
            }
        }
        
        $allActivities[] = $activity;
    }
    
    $stmt->close();
    
    // Get student's overall performance data for this subject
    $performanceQuery = "
        SELECT 
            ROUND(AVG((ag.grade / a.points) * 100), 2) as average_percentage,
            COUNT(CASE WHEN ag.grade IS NOT NULL THEN 1 END) as graded_count,
            COUNT(a.id) as total_count
        FROM activities a
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code = ? AND a.archived = 0
    ";
    
    $stmt = $conn->prepare($performanceQuery);
    $stmt->bind_param("ss", $student_id, $subject_code);
    $stmt->execute();
    $result = $stmt->get_result();
    $performanceData = $result->fetch_assoc();
    $stmt->close();
    
    echo json_encode([
        "success" => true,
        "breakdown" => [
            "all" => $allActivities,
            "passed" => $passed,
            "low" => $lowGrade,
            "failed" => $failed,
            "missed" => $missed,
            "pending" => $pending,
            "counts" => [
                "total" => count($allActivities),
                "passed" => count($passed),
                "low" => count($lowGrade),
                "failed" => count($failed),
                "missed" => count($missed),
                "pending" => count($pending)
            ]
        ],
        "performance" => $performanceData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>