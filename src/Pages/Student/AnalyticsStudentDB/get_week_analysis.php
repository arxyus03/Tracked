<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection - USING YOUR SPECIFIED CREDENTIALS
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
$week = isset($_GET['week']) ? intval($_GET['week']) : 0;

if (empty($student_id) || empty($subject_code) || $week < 1) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid parameters']);
    exit();
}

try {
    // First, we need to get the weekly performance data to understand the week structure
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
    
    $allActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($allActivities)) {
        $response = [
            'success' => true,
            'week' => $week,
            'performance_score' => 0,
            'completion_rate' => 0,
            'average_score' => 0,
            'activities' => 0,
            'submitted' => 0,
            'late_submissions' => 0,
            'status' => 'idle',
            'has_activities' => false,
            'message' => 'No activities in this subject',
            'performance_factors' => [
                [
                    'factor' => 'No Activities',
                    'description' => 'No activities have been created for this subject yet',
                    'impact' => 'neutral',
                    'value' => 'N/A'
                ]
            ],
            'week_activities' => []
        ];
        
        echo json_encode($response);
        exit();
    }
    
    // Group activities by ISO week (same logic as get_weekly_performance.php)
    $weekGroups = [];
    
    foreach ($allActivities as $activity) {
        if (!$activity['deadline']) {
            continue;
        }
        
        $deadlineDate = new DateTime($activity['deadline']);
        
        // Get ISO week number (1-53) and year
        $year = $deadlineDate->format('o'); // ISO year
        $weekNumber = $deadlineDate->format('W'); // ISO week number (01-53)
        
        // Create week key: YYYY-WW
        $weekKey = $year . '-W' . str_pad($weekNumber, 2, '0', STR_PAD_LEFT);
        
        if (!isset($weekGroups[$weekKey])) {
            $weekGroups[$weekKey] = [];
        }
        
        $weekGroups[$weekKey][] = $activity;
    }
    
    // Sort by week key (chronological order)
    ksort($weekGroups);
    
    // Convert to sequential week numbers (1, 2, 3, ...)
    $sequentialWeekGroups = [];
    $sequentialWeekNumber = 1;
    
    foreach ($weekGroups as $weekKey => $activities) {
        $sequentialWeekGroups[$sequentialWeekNumber] = [
            'week_key' => $weekKey,
            'activities' => $activities
        ];
        $sequentialWeekNumber++;
    }
    
    // Check if requested week exists
    if (!isset($sequentialWeekGroups[$week])) {
        $response = [
            'success' => true,
            'week' => $week,
            'performance_score' => 0,
            'completion_rate' => 0,
            'average_score' => 0,
            'activities' => 0,
            'submitted' => 0,
            'late_submissions' => 0,
            'status' => 'idle',
            'has_activities' => false,
            'message' => 'Week number not found',
            'performance_factors' => [
                [
                    'factor' => 'Week Not Found',
                    'description' => 'The selected week number does not exist in the data',
                    'impact' => 'neutral',
                    'value' => 'N/A'
                ]
            ],
            'week_activities' => [],
            'debug_info' => [
                'requested_week' => $week,
                'available_weeks' => array_keys($sequentialWeekGroups),
                'total_activities' => count($allActivities),
                'week_keys' => array_keys($weekGroups)
            ]
        ];
        
        echo json_encode($response);
        exit();
    }
    
    // Get the week data
    $weekData = $sequentialWeekGroups[$week];
    $weekActivities = $weekData['activities'];
    $totalActivities = count($weekActivities);
    
    // Calculate week statistics
    $submittedActivities = 0;
    $totalScore = 0;
    $scoredActivities = 0;
    $lateSubmissions = 0;
    
    foreach ($weekActivities as $activity) {
        if ($activity['submitted'] == 1) {
            $submittedActivities++;
            
            if ($activity['grade'] !== null && $activity['grade'] !== '') {
                $score = floatval($activity['grade']);
                $totalScore += $score;
                $scoredActivities++;
            }
        }
        
        if ($activity['late'] == 1) {
            $lateSubmissions++;
        }
    }
    
    // Calculate completion percentage
    $completionRate = $totalActivities > 0 
        ? round(($submittedActivities / $totalActivities) * 100) 
        : 0;
    
    // Calculate average score
    $averageScore = 0;
    if ($scoredActivities > 0) {
        $averageScore = round($totalScore / $scoredActivities, 1);
    } elseif ($submittedActivities > 0) {
        // Submitted but not graded yet - use completion rate as estimate
        $averageScore = $completionRate;
    }
    
    // Calculate performance score (same formula as get_weekly_performance.php)
    $performanceScore = round(($completionRate * 0.6) + ($averageScore * 0.4));
    if ($performanceScore > 100) $performanceScore = 100;
    
    // Find previous week with activities for comparison
    $previousWeekScore = 0;
    $status = 'stable';
    
    for ($prevWeek = $week - 1; $prevWeek >= 1; $prevWeek--) {
        if (isset($sequentialWeekGroups[$prevWeek])) {
            // Calculate previous week's score
            $prevWeekData = $sequentialWeekGroups[$prevWeek];
            $prevTotal = count($prevWeekData['activities']);
            $prevSubmitted = 0;
            $prevTotalScore = 0;
            $prevScored = 0;
            
            foreach ($prevWeekData['activities'] as $prevActivity) {
                if ($prevActivity['submitted'] == 1) {
                    $prevSubmitted++;
                    if ($prevActivity['grade'] !== null && $prevActivity['grade'] !== '') {
                        $prevTotalScore += floatval($prevActivity['grade']);
                        $prevScored++;
                    }
                }
            }
            
            $prevCompletionRate = $prevTotal > 0 
                ? round(($prevSubmitted / $prevTotal) * 100) 
                : 0;
            
            $prevAverageScore = 0;
            if ($prevScored > 0) {
                $prevAverageScore = round($prevTotalScore / $prevScored, 1);
            } elseif ($prevSubmitted > 0) {
                $prevAverageScore = $prevCompletionRate;
            }
            
            $previousWeekScore = round(($prevCompletionRate * 0.6) + ($prevAverageScore * 0.4));
            if ($previousWeekScore > 100) $previousWeekScore = 100;
            
            // Determine status
            if ($performanceScore > $previousWeekScore) {
                $status = 'improved';
            } elseif ($performanceScore < $previousWeekScore) {
                $status = 'declined';
            } else {
                $status = 'stable';
            }
            
            break;
        }
    }
    
    // If no previous week found
    if ($previousWeekScore == 0 && $week > 1) {
        $status = 'new';
    }
    
    // Generate performance factors
    $performanceFactors = [];
    
    if ($totalActivities > 0) {
        if ($completionRate >= 90) {
            $performanceFactors[] = [
                'factor' => 'Excellent Completion Rate',
                'description' => "Completed $submittedActivities out of $totalActivities activities",
                'impact' => 'positive',
                'value' => '+15%'
            ];
        } elseif ($completionRate >= 70) {
            $performanceFactors[] = [
                'factor' => 'Good Completion Rate',
                'description' => "Completed $submittedActivities out of $totalActivities activities",
                'impact' => 'positive',
                'value' => '+8%'
            ];
        } elseif ($completionRate > 0) {
            $performanceFactors[] = [
                'factor' => 'Low Completion Rate',
                'description' => "Only completed $submittedActivities out of $totalActivities activities",
                'impact' => 'negative',
                'value' => '-10%'
            ];
        } else {
            $performanceFactors[] = [
                'factor' => 'No Submissions',
                'description' => "Did not submit any activities this week",
                'impact' => 'negative',
                'value' => '-20%'
            ];
        }
        
        if ($scoredActivities > 0) {
            if ($averageScore >= 85) {
                $performanceFactors[] = [
                    'factor' => 'High Quality Work',
                    'description' => "Average score of $averageScore% on graded activities",
                    'impact' => 'positive',
                    'value' => '+12%'
                ];
            } elseif ($averageScore >= 75) {
                $performanceFactors[] = [
                    'factor' => 'Satisfactory Performance',
                    'description' => "Average score of $averageScore% on graded activities",
                    'impact' => 'positive',
                    'value' => '+6%'
                ];
            }
        } elseif ($submittedActivities > 0) {
            $performanceFactors[] = [
                'factor' => 'Awaiting Grades',
                'description' => "Submitted $submittedActivities activities - awaiting instructor grading",
                'impact' => 'neutral',
                'value' => 'Pending'
            ];
        }
        
        if ($lateSubmissions > 0) {
            $performanceFactors[] = [
                'factor' => 'Late Submissions',
                'description' => "$lateSubmissions submission(s) were submitted late",
                'impact' => 'negative',
                'value' => '-5%'
            ];
        } elseif ($submittedActivities > 0) {
            $performanceFactors[] = [
                'factor' => 'Timely Submissions',
                'description' => 'All submissions were on time',
                'impact' => 'positive',
                'value' => '+5%'
            ];
        }
        
        if ($submittedActivities > 0 && $scoredActivities < $submittedActivities) {
            $ungradedCount = $submittedActivities - $scoredActivities;
            $performanceFactors[] = [
                'factor' => 'Ungraded Submissions',
                'description' => "$ungradedCount submitted activity(ies) not graded yet",
                'impact' => 'neutral',
                'value' => 'Pending'
            ];
        }
    }
    
    // Format week activities for display
    $formattedWeekActivities = array_map(function($activity) {
        $deadlineDate = new DateTime($activity['deadline']);
        $now = new DateTime();
        
        $status = 'pending';
        if ($activity['submitted'] == 1) {
            if ($activity['grade'] !== null && $activity['grade'] !== '') {
                $status = 'graded';
            } else {
                $status = 'submitted';
            }
        } elseif ($deadlineDate < $now) {
            $status = 'missed';
        }
        
        return [
            'id' => $activity['id'],
            'activity_type' => $activity['activity_type'],
            'task_number' => $activity['task_number'],
            'title' => $activity['title'],
            'deadline' => $activity['deadline'],
            'deadline_formatted' => $deadlineDate->format('M d, Y g:i A'),
            'grade' => $activity['grade'],
            'status' => $status,
            'late' => $activity['late'],
            'points' => $activity['points']
        ];
    }, $weekActivities);
    
    // Get date range for this week
    $deadlines = array_column($weekActivities, 'deadline');
    sort($deadlines);
    
    if (!empty($deadlines)) {
        $firstDeadline = new DateTime($deadlines[0]);
        $lastDeadline = new DateTime(end($deadlines));
        
        $dateRange = [
            'start' => $firstDeadline->format('M d, Y'),
            'end' => $lastDeadline->format('M d, Y')
        ];
    } else {
        $dateRange = [
            'start' => 'No date',
            'end' => 'No date'
        ];
    }
    
    // Get ISO week dates for display
    $weekKey = $weekData['week_key'];
    preg_match('/(\d{4})-W(\d{2})/', $weekKey, $matches);
    if (count($matches) === 3) {
        $year = $matches[1];
        $isoWeek = $matches[2];
        
        $firstDay = new DateTime();
        $firstDay->setISODate($year, $isoWeek);
        $lastDay = clone $firstDay;
        $lastDay->modify('+6 days');
        
        $isoDateRange = [
            'start' => $firstDay->format('M d, Y'),
            'end' => $lastDay->format('M d, Y'),
            'iso_week' => "Week $isoWeek of $year"
        ];
    } else {
        $isoDateRange = $dateRange;
    }
    
    $response = [
        'success' => true,
        'week' => $week,
        'week_key' => $weekKey,
        'date_range' => $dateRange,
        'iso_date_range' => $isoDateRange,
        'performance_score' => $performanceScore,
        'completion_rate' => $completionRate,
        'average_score' => $averageScore,
        'activities' => $totalActivities,
        'submitted' => $submittedActivities,
        'graded' => $scoredActivities,
        'late_submissions' => $lateSubmissions,
        'previous_week_score' => $previousWeekScore,
        'performance_change' => $previousWeekScore > 0 ? $performanceScore - $previousWeekScore : 0,
        'status' => $status,
        'has_activities' => true,
        'performance_factors' => $performanceFactors,
        'week_activities' => $formattedWeekActivities
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>