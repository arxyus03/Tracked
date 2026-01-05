<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration - UPDATED WITH YOUR CREDENTIALS
$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

$response = ['success' => false, 'percentage' => 0, 'activities_needed' => [], 'low_grade_activities' => []];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : null;
    $subject_code = isset($_GET['subject_code']) ? $_GET['subject_code'] : null;

    if ($student_id && $subject_code) {
        try {
            // Create database connection
            $conn = new mysqli($servername, $username, $password, $dbname);
            
            // Check connection
            if ($conn->connect_error) {
                $response['error'] = 'Database connection failed: ' . $conn->connect_error;
                echo json_encode($response);
                exit;
            }
            
            // Convert student_id to string for database query (your student_ID is varchar)
            $student_id_str = (string)$student_id;
            
            // 1. Calculate Academic Performance - ONLY BASED ON GRADED ACTIVITIES
            $academic_percentage = 0;
            $activities_needed = [];
            $low_grade_activities = [];
            $graded_activity_count = 0;
            $total_actual_score = 0;
            
            // Fetch all activities for this student in this subject
            $query = "
                SELECT 
                    a.id,
                    a.activity_type,
                    a.title,
                    ag.grade,
                    ag.submitted,
                    a.points as max_points
                FROM activities a
                LEFT JOIN activity_grades ag ON a.id = ag.activity_ID 
                    AND ag.student_ID = ?
                WHERE a.subject_code = ?
                AND (a.activity_type IN ('quiz', 'assignment', 'activity', 'project', 'laboratory', 'exam'))
                AND a.archived = 0  -- Only include non-archived activities
                ORDER BY a.created_at
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $student_id_str, $subject_code);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $activities = [];
            while ($row = $result->fetch_assoc()) {
                $activities[] = $row;
            }
            $stmt->close();
            
            $total_activity_count = count($activities);
            
            if ($total_activity_count > 0) {
                foreach ($activities as $activity) {
                    // IMPORTANT: ONLY count activities that have been graded
                    // Pending activities (grade is NULL) are NOT included in academic calculation
                    if ($activity['grade'] !== null && $activity['grade'] !== '') {
                        // Convert grade to percentage based on max_points
                        $max_points = $activity['max_points'] ? intval($activity['max_points']) : 100;
                        if ($max_points > 0) {
                            $grade_value = floatval($activity['grade']);
                            $percentage_score = ($grade_value / $max_points) * 100;
                            $total_actual_score += min($percentage_score, 100); // Cap at 100
                            $graded_activity_count++; // Count this as a graded activity
                            
                            // Check for low grade activities (< 75%)
                            if ($percentage_score < 75 && $percentage_score > 0) {
                                $low_grade_activities[] = [
                                    'id' => $activity['id'],
                                    'title' => $activity['title'],
                                    'type' => $activity['activity_type'],
                                    'grade' => $grade_value,
                                    'max_points' => $max_points,
                                    'percentage' => round($percentage_score, 2)
                                ];
                            }
                        }
                    } else {
                        // Activity not submitted or not graded - EXCLUDED FROM ACADEMIC CALCULATION
                        // Only added to suggestions
                        $activities_needed[] = [
                            'id' => $activity['id'],
                            'title' => $activity['title'],
                            'type' => $activity['activity_type']
                        ];
                    }
                }
                
                // Calculate academic percentage - ONLY based on GRADED activities
                if ($graded_activity_count > 0) {
                    $total_possible_score = $graded_activity_count * 100; // Each graded activity worth 100 points
                    $academic_percentage = ($total_actual_score / $total_possible_score) * 100;
                } else {
                    // If no activities are graded yet, academic percentage is 0
                    $academic_percentage = 0;
                }
            }
            
            // 2. Calculate Attendance Performance
            $attendance_percentage = 0;
            $attendance_data_found = false;
            
            // Fetch attendance records for this student in this subject
            $attendance_query = "
                SELECT 
                    status as attendance_status,
                    COUNT(*) as count
                FROM attendance
                WHERE student_ID = ?
                AND subject_code = ?
                GROUP BY status
            ";
            
            $attendance_stmt = $conn->prepare($attendance_query);
            $attendance_stmt->bind_param("ss", $student_id_str, $subject_code);
            $attendance_stmt->execute();
            $attendance_result = $attendance_stmt->get_result();
            
            $attendance_data = [];
            while ($row = $attendance_result->fetch_assoc()) {
                $attendance_data[] = $row;
                $attendance_data_found = true;
            }
            $attendance_stmt->close();
            
            if ($attendance_data_found && count($attendance_data) > 0) {
                $attendance_points = 0;
                $total_days = 0;
                
                foreach ($attendance_data as $record) {
                    $count = intval($record['count']);
                    $total_days += $count;
                    
                    switch ($record['attendance_status']) {
                        case 'present':
                            $attendance_points += $count * 100;
                            break;
                        case 'late':
                            $attendance_points += $count * 50;
                            break;
                        case 'absent':
                            $attendance_points += $count * 0;
                            break;
                    }
                }
                
                // Calculate attendance percentage
                if ($total_days > 0) {
                    $attendance_percentage = ($attendance_points / ($total_days * 100)) * 100;
                }
            }
            // If no attendance records found, attendance_percentage remains 0
            
            // 3. Calculate Overall Current Performance - Weighted average 
            // ACADEMIC: 75% weight (as requested)
            // ATTENDANCE: 25% weight (as requested)
            $academic_weight = 0.75;  // 75% weight for academics
            $attendance_weight = 0.25; // 25% weight for attendance
            
            $current_performance = ($academic_percentage * $academic_weight) + ($attendance_percentage * $attendance_weight);
            
            // Round to 2 decimal places
            $overall_percentage = round($current_performance, 2);
            
            // Cap at 100% - no one can exceed 100%
            if ($overall_percentage > 100) {
                $overall_percentage = 100;
            }
            
            $response = [
                'success' => true,
                'percentage' => $overall_percentage,
                'academic_percentage' => round($academic_percentage, 2),
                'attendance_percentage' => round($attendance_percentage, 2),
                'academic_weight' => $academic_weight,
                'attendance_weight' => $attendance_weight,
                'graded_activity_count' => $graded_activity_count,
                'total_activity_count' => $total_activity_count,
                'total_actual_score' => $total_actual_score,
                'activities_needed' => $activities_needed,
                'low_grade_activities' => $low_grade_activities,
                'message' => 'Performance calculated successfully',
                'calculation_details' => [
                    'academic_contribution' => round($academic_percentage * $academic_weight, 2),
                    'attendance_contribution' => round($attendance_percentage * $attendance_weight, 2)
                ]
            ];
            
            // Close connection
            $conn->close();
            
        } catch (Exception $e) {
            $response['error'] = 'Database error: ' . $e->getMessage();
        }
    } else {
        $response['error'] = 'Missing required parameters: student_id and subject_code';
    }
} else {
    $response['error'] = 'Invalid request method';
}

echo json_encode($response);
?>