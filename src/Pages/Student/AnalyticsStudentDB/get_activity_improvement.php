<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration - UPDATED WITH YOUR CREDENTIALS
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get parameters
    $student_id = $_GET['student_id'] ?? '';
    $subject_code = $_GET['subject_code'] ?? '';
    $activity_type = $_GET['activity_type'] ?? '';

    if (!$student_id || !$subject_code) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
        exit;
    }

    // First, try to get activities from student_activities table
    $sql = "
        SELECT 
            a.id as activity_id,
            a.activity_type,
            a.task_number,
            a.title,
            a.max_score,
            a.deadline,
            sa.score,
            sa.submitted,
            sa.submitted_date,
            sa.late,
            sa.created_at
        FROM activities a
        LEFT JOIN student_activities sa ON a.id = sa.activity_id 
            AND sa.student_id = :student_id
        WHERE a.subject_code = :subject_code
        AND (LOWER(a.activity_type) = LOWER(:activity_type) OR :activity_type = '')
        AND a.deleted_at IS NULL
        AND sa.id IS NOT NULL
        ORDER BY a.task_number ASC, a.deadline ASC, a.created_at ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':subject_code', $subject_code);
    $stmt->bindParam(':activity_type', $activity_type);
    $stmt->execute();
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no activities found, try alternative query
    if (empty($activities)) {
        // Alternative query for different table structure
        $sql2 = "
            SELECT 
                activity_id,
                activity_type,
                task_number,
                title,
                max_score,
                deadline,
                score,
                submitted,
                submission_date as submitted_date,
                late,
                created_at
            FROM student_activities 
            WHERE student_id = :student_id
            AND subject_code = :subject_code
            AND (LOWER(activity_type) = LOWER(:activity_type) OR :activity_type = '')
            ORDER BY task_number ASC, deadline ASC, created_at ASC
        ";
        
        $stmt2 = $pdo->prepare($sql2);
        $stmt2->bindParam(':student_id', $student_id);
        $stmt2->bindParam(':subject_code', $subject_code);
        $stmt2->bindParam(':activity_type', $activity_type);
        $stmt2->execute();
        $activities = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    }

    if (empty($activities)) {
        echo json_encode([
            'success' => true,
            'improvement_data' => [
                'has_improvement_data' => false,
                'message' => 'No activities found for this student and subject'
            ]
        ]);
        exit;
    }

    // Group activities by type
    $organized_activities = [];
    foreach ($activities as $activity) {
        $type = strtolower($activity['activity_type']);
        
        if (!isset($organized_activities[$type])) {
            $organized_activities[$type] = [];
        }
        
        $organized_activities[$type][] = $activity;
    }

    // If specific activity type requested, process only that type
    if ($activity_type) {
        $type_lower = strtolower($activity_type);
        $type_activities = isset($organized_activities[$type_lower]) 
            ? $organized_activities[$type_lower] 
            : [];
        
        $improvement_data = processImprovementData($type_activities, $type_lower);
    } else {
        // Process all activity types
        $improvement_data = [];
        foreach ($organized_activities as $type => $type_activities) {
            $improvement_data[$type] = processImprovementData($type_activities, $type);
        }
    }

    echo json_encode([
        'success' => true,
        'improvement_data' => $improvement_data
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Function to process improvement data for a specific activity type
function processImprovementData($activities, $type) {
    if (count($activities) < 2) {
        return [
            'has_improvement_data' => false,
            'message' => 'Need at least 2 activities to determine improvement',
            'count' => count($activities)
        ];
    }

    // Sort by task_number or submission_date
    usort($activities, function($a, $b) {
        // First try task_number
        if ($a['task_number'] && $b['task_number']) {
            return $a['task_number'] - $b['task_number'];
        }
        // Then try deadline
        if ($a['deadline'] && $b['deadline']) {
            return strtotime($a['deadline']) - strtotime($b['deadline']);
        }
        // Finally try submission date
        return strtotime($a['submitted_date'] ?? $a['created_at']) - strtotime($b['submitted_date'] ?? $b['created_at']);
    });

    $scores = [];
    $improvement_rates = [];
    $processed_activities = [];
    
    // Calculate percentage scores
    foreach ($activities as $index => $act) {
        $max_score = $act['max_score'] ?: 100; // Default to 100 if not set
        $score = $act['score'] ?: 0;
        $percentage = ($max_score > 0) ? ($score / $max_score) * 100 : 0;
        $scores[] = $percentage;
        
        // Store activity with percentage
        $processed_activity = [
            'id' => $act['activity_id'] ?? $index,
            'title' => $act['title'] ?? "Activity " . ($index + 1),
            'task_number' => $act['task_number'] ?? ($index + 1),
            'score' => $score,
            'max_score' => $max_score,
            'percentage' => round($percentage, 2),
            'improved' => false,
            'improvement_rate' => 0,
            'previous_score' => null,
            'submitted' => $act['submitted'] ?? 0,
            'late' => $act['late'] ?? 0
        ];
        
        $processed_activities[] = $processed_activity;
    }

    // Calculate improvement between consecutive activities
    for ($i = 1; $i < count($scores); $i++) {
        $improvement = $scores[$i] - $scores[$i - 1];
        $improvement_rates[] = $improvement;
        
        // Mark as improved if score increased
        $processed_activities[$i]['improved'] = $improvement > 0;
        $processed_activities[$i]['improvement_rate'] = round($improvement, 2);
        $processed_activities[$i]['previous_score'] = $scores[$i - 1];
    }

    // Calculate overall improvement
    $overall_improvement = 0;
    $average_improvement = 0;
    
    if (count($improvement_rates) > 0) {
        $overall_improvement = end($scores) - $scores[0];
        $average_improvement = array_sum($improvement_rates) / count($improvement_rates);
    }

    // Determine trend
    $trend = 'stable';
    if ($average_improvement > 5) {
        $trend = 'improving';
    } elseif ($average_improvement < -5) {
        $trend = 'declining';
    } elseif (abs($average_improvement) <= 5) {
        $trend = 'stable';
    }

    return [
        'has_improvement_data' => true,
        'activities' => $processed_activities,
        'scores' => $scores,
        'improvement_rates' => $improvement_rates,
        'overall_improvement' => round($overall_improvement, 2),
        'average_improvement' => round($average_improvement, 2),
        'trend' => $trend,
        'first_score' => round($scores[0], 2),
        'last_score' => round(end($scores), 2),
        'count' => count($activities),
        'type' => $type
    ];
}
?>