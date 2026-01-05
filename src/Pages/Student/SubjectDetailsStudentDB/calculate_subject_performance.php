<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database configuration - USING YOUR CREDENTIALS
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

$response = array('success' => false, 'message' => '', 'performance_data' => null);

try {
    if (isset($_GET['student_id']) && isset($_GET['subject_code'])) {
        $student_id = $conn->real_escape_string($_GET['student_id']);
        $subject_code = $conn->real_escape_string($_GET['subject_code']);
        
        // Initialize performance data structure
        $performance_data = array(
            'subject_code' => $subject_code,
            'academic_percentage' => 0,
            'attendance_percentage' => 0,
            'final_percentage' => 0,
            'graded_activities_count' => 0,
            'total_activities' => 0,
            'attendance_summary' => array(
                'present_days' => 0,
                'late_days' => 0,
                'absent_days' => 0,
                'total_days' => 0
            ),
            'graded_activities' => array()
        );
        
        // PART 1: Calculate Academic Performance (75% weight) - ONLY graded activities
        $academic_sql = "
            SELECT 
                a.id,
                a.title,
                a.activity_type,
                a.task_number,
                COALESCE(a.points, 100) as total_points,
                ag.grade,
                ag.submitted,
                ag.late
            FROM activities a
            LEFT JOIN activity_grades ag ON a.id = ag.activity_ID 
                AND ag.student_ID = '$student_id'
            WHERE a.subject_code = '$subject_code'
            AND (a.archived = 0 OR a.archived IS NULL)
            AND ag.grade IS NOT NULL
            AND ag.grade != ''
            AND ag.submitted = 1
            ORDER BY a.created_at DESC
        ";
        
        $academic_result = $conn->query($academic_sql);
        
        if (!$academic_result) {
            throw new Exception("Academic query failed: " . $conn->error);
        }
        
        $total_percentage_sum = 0;
        $graded_count = 0;
        
        while ($activity = $academic_result->fetch_assoc()) {
            $total_points = floatval($activity['total_points']) ?: 100; // Default to 100 if 0
            $grade = floatval($activity['grade']);
            
            // Calculate percentage for this graded activity
            $activity_percentage = ($total_points > 0) ? ($grade / $total_points) * 100 : 0;
            
            $performance_data['graded_activities'][] = array(
                'id' => $activity['id'],
                'title' => $activity['title'],
                'type' => $activity['activity_type'],
                'task_number' => $activity['task_number'],
                'total_points' => $total_points,
                'grade' => $grade,
                'percentage' => round($activity_percentage, 2)
            );
            
            $total_percentage_sum += $activity_percentage;
            $graded_count++;
        }
        
        // Calculate academic percentage average (only from graded activities)
        $academic_percentage = ($graded_count > 0) ? ($total_percentage_sum / $graded_count) : 0;
        
        // PART 2: Get total activities count
        $total_sql = "
            SELECT COUNT(*) as total_count
            FROM activities a
            WHERE a.subject_code = '$subject_code'
            AND (a.archived = 0 OR a.archived IS NULL)
        ";
        
        $total_result = $conn->query($total_sql);
        $total_row = $total_result->fetch_assoc();
        $total_activities = intval($total_row['total_count']);
        
        // PART 3: Calculate Attendance Performance (25% weight)
        $attendance_sql = "
            SELECT 
                status,
                COUNT(*) as count
            FROM attendance 
            WHERE student_id = '$student_id' 
            AND subject_code = '$subject_code'
            GROUP BY status
        ";
        
        $attendance_result = $conn->query($attendance_sql);
        
        if (!$attendance_result) {
            throw new Exception("Attendance query failed: " . $conn->error);
        }
        
        $present_days = 0;
        $late_days = 0;
        $absent_days = 0;
        $total_days = 0;
        
        while ($attendance = $attendance_result->fetch_assoc()) {
            $status = $attendance['status'];
            $count = intval($attendance['count']);
            
            switch ($status) {
                case 'present':
                    $present_days = $count;
                    break;
                case 'late':
                    $late_days = $count;
                    break;
                case 'absent':
                    $absent_days = $count;
                    break;
            }
            
            $total_days += $count;
        }
        
        // Calculate attendance percentage
        // Present = 100%, Late = 50%, Absent = 0%
        $attendance_points = ($present_days * 100) + ($late_days * 50) + ($absent_days * 0);
        $total_possible_points = ($total_days > 0) ? ($total_days * 100) : 0;
        $attendance_percentage = ($total_possible_points > 0) ? ($attendance_points / $total_possible_points) * 100 : 0;
        
        // PART 4: Calculate Final Performance Score
        $final_percentage = ($academic_percentage * 0.75) + ($attendance_percentage * 0.25);
        
        // Update performance data
        $performance_data['academic_percentage'] = round($academic_percentage, 2);
        $performance_data['attendance_percentage'] = round($attendance_percentage, 2);
        $performance_data['final_percentage'] = round($final_percentage, 2);
        $performance_data['graded_activities_count'] = $graded_count;
        $performance_data['total_activities'] = $total_activities;
        $performance_data['attendance_summary'] = array(
            'present_days' => $present_days,
            'late_days' => $late_days,
            'absent_days' => $absent_days,
            'total_days' => $total_days
        );
        
        $response['success'] = true;
        $response['performance_data'] = $performance_data;
        
    } else {
        $response['message'] = 'Missing required parameters: student_id and subject_code';
    }
    
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
$conn->close();
?>