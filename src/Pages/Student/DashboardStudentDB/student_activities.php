<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

if (isset($_GET['student_id'])) {
    $student_id = $_GET['student_id'];
    
    $response = [
        "success" => false,
        "total_activities" => 0,
        "submitted_activities" => 0,
        "missed_activities" => 0,
        "active_activities" => 0,
        "activities_by_status" => [
            "missed" => [],
            "active" => [],
            "submitted" => []
        ],
        "total_counts" => [
            "missed" => 0,
            "active" => 0,
            "submitted" => 0
        ],
        "debug" => [
            "student_id" => $student_id,
            "subjects_found" => [],
            "activities_found" => 0,
            "grades_found" => 0
        ]
    ];

    try {
        // Get all subjects the student is enrolled in (non-archived)
        $subject_query = "SELECT sc.subject_code, c.subject 
                         FROM student_classes sc 
                         JOIN classes c ON sc.subject_code = c.subject_code 
                         WHERE sc.student_ID = ? AND sc.archived = 0 AND c.status = 'Active'";
        
        $stmt = $conn->prepare($subject_query);
        $stmt->bind_param("s", $student_id);
        $stmt->execute();
        $subject_result = $stmt->get_result();
        
        $subjects = [];
        while ($row = $subject_result->fetch_assoc()) {
            $subjects[$row['subject_code']] = $row['subject'];
            $response['debug']['subjects_found'][] = $row['subject_code'] . " - " . $row['subject'];
        }
        $stmt->close();
        
        $response['debug']['subjects_count'] = count($subjects);
        
        if (empty($subjects)) {
            $response['message'] = "No active subjects found for student";
            echo json_encode($response);
            exit;
        }
        
        // Prepare subject codes for IN clause
        $subject_codes = array_keys($subjects);
        $placeholders = str_repeat('?,', count($subject_codes) - 1) . '?';
        
        // Get all activities for these subjects (non-archived)
        $activity_query = "SELECT a.*, c.subject 
                          FROM activities a 
                          JOIN classes c ON a.subject_code = c.subject_code 
                          WHERE a.subject_code IN ($placeholders) 
                          AND a.archived = 0 
                          AND c.status = 'Active'
                          ORDER BY a.deadline ASC";
        
        $stmt = $conn->prepare($activity_query);
        
        // Bind parameters: all subject codes
        $types = str_repeat('s', count($subject_codes));
        $stmt->bind_param($types, ...$subject_codes);
        $stmt->execute();
        $activity_result = $stmt->get_result();
        
        $all_activities = [];
        $now = date('Y-m-d H:i:s');
        
        while ($activity = $activity_result->fetch_assoc()) {
            $activity['subject'] = $subjects[$activity['subject_code']];
            
            // Check if student has submitted/graded this activity (using activity_grades table)
            $grade_query = "SELECT id, grade, submitted, late FROM activity_grades 
                           WHERE activity_ID = ? AND student_ID = ? 
                           LIMIT 1";
            $grade_stmt = $conn->prepare($grade_query);
            $grade_stmt->bind_param("is", $activity['id'], $student_id);
            $grade_stmt->execute();
            $grade_result = $grade_stmt->get_result();
            $grade = $grade_result->fetch_assoc();
            $grade_stmt->close();
            
            // In your system, activity is submitted if grade record exists and submitted = 1
            $activity['submitted'] = ($grade !== null && isset($grade['submitted']) && $grade['submitted'] == 1);
            $activity['late'] = ($grade && isset($grade['late']) && $grade['late'] == 1);
            $activity['grade'] = ($grade && isset($grade['grade'])) ? $grade['grade'] : null;
            
            $response['debug']['grades_found'] += ($activity['submitted'] ? 1 : 0);
            
            // Determine activity status
            $deadline = $activity['deadline'];
            $has_deadline = !empty($deadline) && $deadline != '0000-00-00 00:00:00';
            
            if ($activity['submitted']) {
                $status = 'submitted';
                $response['submitted_activities']++;
                $response['total_counts']['submitted']++;
            } else if ($has_deadline && strtotime($deadline) < strtotime($now)) {
                $status = 'missed';
                $response['missed_activities']++;
                $response['total_counts']['missed']++;
            } else {
                $status = 'active';
                $response['active_activities']++;
                $response['total_counts']['active']++;
            }
            
            $activity['status'] = $status;
            
            // Add to response arrays
            $activity_item = [
                'id' => $activity['id'],
                'subject_code' => $activity['subject_code'],
                'subject' => $activity['subject'],
                'activity_type' => $activity['activity_type'],
                'task_number' => $activity['task_number'],
                'title' => $activity['title'],
                'instruction' => $activity['instruction'],
                'link' => $activity['link'],
                'points' => $activity['points'],
                'deadline' => $activity['deadline'],
                'created_at' => $activity['created_at'],
                'submitted' => $activity['submitted'],
                'late' => $activity['late'],
                'grade' => $activity['grade'],
                'status' => $status,
                'professor_ID' => $activity['professor_ID']
            ];
            
            $all_activities[] = $activity_item;
            $response['activities_by_status'][$status][] = $activity_item;
        }
        
        $response['total_activities'] = count($all_activities);
        $response['success'] = true;
        $response['activities'] = $all_activities;
        $response['debug']['activities_found'] = count($all_activities);
        
        $stmt->close();
        
    } catch (Exception $e) {
        $response['message'] = "Error: " . $e->getMessage();
        $response['debug']['error'] = $e->getMessage();
    }
    
    echo json_encode($response);
    
} else {
    echo json_encode(["success" => false, "message" => "Student ID required"]);
}

$conn->close();
?>