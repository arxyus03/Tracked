<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection - UPDATED CREDENTIALS
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get parameters
$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : '';
$subject_code = isset($_GET['subject_code']) ? $_GET['subject_code'] : '';

if (empty($student_id) || empty($subject_code)) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit();
}

try {
    // Get all activities for this subject with their grades
    $query = "SELECT 
                a.id,
                a.activity_type,
                a.title,
                a.deadline,
                a.task_number,
                a.points,
                ag.grade,
                ag.submitted,
                ag.submitted_at,
                ag.late
              FROM activities a
              LEFT JOIN activity_grades ag ON a.id = ag.activity_ID 
                AND ag.student_ID = :student_id
              WHERE a.subject_code = :subject_code
                AND a.archived = 0
                AND a.deadline IS NOT NULL
              ORDER BY a.deadline ASC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        'student_id' => $student_id,
        'subject_code' => $subject_code
    ]);
    
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($activities)) {
        echo json_encode(['success' => true, 'weeks' => []]);
        exit();
    }
    
    // Group activities by their deadline week (ISO week number)
    $weekData = [];
    
    foreach ($activities as $activity) {
        if (!$activity['deadline']) {
            continue;
        }
        
        $deadlineDate = new DateTime($activity['deadline']);
        
        // Get ISO week number (1-53) and year
        $year = $deadlineDate->format('o'); // ISO year
        $weekNumber = $deadlineDate->format('W'); // ISO week number (01-53)
        
        // Create week key: YYYY-WW
        $weekKey = $year . '-W' . str_pad($weekNumber, 2, '0', STR_PAD_LEFT);
        
        if (!isset($weekData[$weekKey])) {
            // Get first day of this ISO week
            $firstDayOfWeek = clone $deadlineDate;
            $firstDayOfWeek->modify('monday this week');
            
            $lastDayOfWeek = clone $firstDayOfWeek;
            $lastDayOfWeek->modify('sunday this week');
            
            $weekData[$weekKey] = [
                'week_key' => $weekKey,
                'year' => $year,
                'week_number' => intval($weekNumber),
                'first_day' => $firstDayOfWeek->format('Y-m-d'),
                'last_day' => $lastDayOfWeek->format('Y-m-d'),
                'activities' => 0,
                'submitted' => 0,
                'scores' => [],
                'late' => 0,
                'deadline_date' => $deadlineDate->format('Y-m-d H:i:s')
            ];
        }
        
        $weekData[$weekKey]['activities']++;
        
        // Count submissions
        if ($activity['submitted'] == 1) {
            $weekData[$weekKey]['submitted']++;
            
            // Add score if exists AND is not null
            if ($activity['grade'] !== null && $activity['grade'] !== '') {
                $score = floatval($activity['grade']);
                $weekData[$weekKey]['scores'][] = $score;
            }
        }
        
        // Count late submissions
        if ($activity['late'] == 1) {
            $weekData[$weekKey]['late']++;
        }
    }
    
    // Sort by week key (chronological order)
    ksort($weekData);
    
    // Assign sequential week numbers (1, 2, 3, ...) for display
    $performanceTrend = [];
    $sequentialWeekNumber = 1;
    $lastValidWeekScore = null;
    
    foreach ($weekData as $weekKey => $data) {
        $firstDay = new DateTime($data['first_day']);
        $lastDay = new DateTime($data['last_day']);
        
        // Create display label
        if ($firstDay->format('M') === $lastDay->format('M')) {
            // Same month
            $label = $firstDay->format('M d') . ' - ' . $lastDay->format('d, Y');
        } else {
            // Different months
            $label = $firstDay->format('M d') . ' - ' . $lastDay->format('M d, Y');
        }
        
        // Calculate completion percentage
        $completionRate = $data['activities'] > 0 
            ? round(($data['submitted'] / $data['activities']) * 100) 
            : 0;
        
        // Calculate average score
        $averageScore = 0;
        if (!empty($data['scores'])) {
            $averageScore = round(array_sum($data['scores']) / count($data['scores']), 1);
        } elseif ($data['submitted'] > 0) {
            // Submitted but no grades yet - use completion rate as estimate
            $averageScore = $completionRate;
        }
        
        // Calculate performance score
        $performanceScore = round(($completionRate * 0.6) + ($averageScore * 0.4));
        if ($performanceScore > 100) $performanceScore = 100;
        
        // Determine status
        $status = 'stable';
        if ($lastValidWeekScore !== null) {
            if ($performanceScore > $lastValidWeekScore) {
                $status = 'improved';
            } elseif ($performanceScore < $lastValidWeekScore) {
                $status = 'declined';
            }
        } else {
            $status = 'new';
        }
        
        $performanceTrend[] = [
            'week' => $sequentialWeekNumber, // Sequential week number for the chart
            'iso_week' => $data['week_number'], // ISO week number
            'week_key' => $weekKey,
            'label' => $label,
            'score' => $performanceScore,
            'activities' => $data['activities'],
            'submitted' => $data['submitted'],
            'completion_rate' => $completionRate,
            'average_score' => $averageScore,
            'late' => $data['late'],
            'status' => $status,
            'has_activities' => true,
            'first_day' => $data['first_day'],
            'last_day' => $data['last_day']
        ];
        
        $lastValidWeekScore = $performanceScore;
        $sequentialWeekNumber++;
    }
    
    echo json_encode([
        'success' => true,
        'weeks' => $performanceTrend,
        'total_weeks' => count($performanceTrend),
        'debug_info' => [
            'activities_count' => count($activities),
            'week_groups' => array_keys($weekData)
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>