<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

// Create connection
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get student ID from request
$studentId = $_POST['student_id'] ?? '';

if (empty($studentId)) {
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

try {
    $notifications = [];
    
    // 1. Get professor announcements
    $announcements = getAnnouncements($pdo, $studentId);
    $notifications = array_merge($notifications, $announcements);
    
    // 2. Get new school work/assignments
    $newAssignments = getNewAssignments($pdo, $studentId);
    $notifications = array_merge($notifications, $newAssignments);
    
    // 3. Get upcoming deadlines
    $upcomingDeadlines = getUpcomingDeadlines($pdo, $studentId);
    $notifications = array_merge($notifications, $upcomingDeadlines);
    
    // 4. Check for 3+ absences risk
    $attendanceRisk = getAttendanceRisk($pdo, $studentId);
    $notifications = array_merge($notifications, $attendanceRisk);
    
    // 5. Check for 3+ late arrivals
    $lateArrivals = getLateArrivals($pdo, $studentId);
    $notifications = array_merge($notifications, $lateArrivals);
    
    // 6. Check for late/missed activities
    $lateActivities = getLateActivities($pdo, $studentId);
    $notifications = array_merge($notifications, $lateActivities);
    
    // 7. Check for failing subjects based on missed activities
    $failingSubjects = getFailingSubjects($pdo, $studentId);
    $notifications = array_merge($notifications, $failingSubjects);
    
    usort($notifications, function($a, $b) {
        if ($a['priority'] == $b['priority']) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        }
        return $b['priority'] - $a['priority'];
    });
    
    // Get unread count
    $unreadCount = count(array_filter($notifications, function($notification) {
        return !$notification['isRead'];
    }));
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unreadCount' => $unreadCount,
        'totalCount' => count($notifications)
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

function getAnnouncements($pdo, $studentId) {
    // Get announcements from the last 7 days
    $stmt = $pdo->prepare("
        SELECT 
            a.announcement_ID as id,
            a.title,
            a.description,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code,
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as professor_name,
            a.created_at
        FROM announcements a
        JOIN classes c ON a.classroom_ID = c.subject_code
        JOIN tracked_users t ON a.professor_ID = t.tracked_ID
        WHERE a.classroom_ID IN (
            SELECT sc.subject_code 
            FROM student_classes sc 
            WHERE sc.student_ID = ? AND sc.archived = 0
        )
        AND a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$studentId]);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($announcements as $announcement) {
        $timeAgo = getTimeAgo($announcement['created_at']);
        $notifications[] = [
            'id' => 'announcement_' . $announcement['id'],
            'type' => 'announcement',
            'title' => 'New Announcement',
            'description' => "{$announcement['professor_name']} posted: '{$announcement['title']}' in {$announcement['subject']} ({$announcement['section']}). {$timeAgo}",
            'subject' => $announcement['subject'],
            'section' => $announcement['section'],
            'subject_code' => $announcement['subject_code'],
            'announcement_id' => $announcement['id'],
            'professor_name' => $announcement['professor_name'],
            'priority' => 1, // Normal priority
            'created_at' => $announcement['created_at'],
            'isRead' => false
        ];
    }
    return $notifications;
}

function getNewAssignments($pdo, $studentId) {
    // Get new activities from the last 3 days
    $stmt = $pdo->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.activity_type,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code,
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as professor_name,
            a.created_at
        FROM activities a
        JOIN classes c ON a.subject_code = c.subject_code
        JOIN tracked_users t ON c.professor_ID = t.tracked_ID
        WHERE a.subject_code IN (
            SELECT sc.subject_code 
            FROM student_classes sc 
            WHERE sc.student_ID = ? AND sc.archived = 0
        )
        AND a.archived = 0
        AND a.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$studentId]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($assignments as $assignment) {
        $timeAgo = getTimeAgo($assignment['created_at']);
        $notifications[] = [
            'id' => 'assignment_' . $assignment['activity_id'],
            'type' => 'new_assignment',
            'title' => 'New Assignment Posted',
            'description' => "{$assignment['professor_name']} posted a new {$assignment['activity_type']}: '{$assignment['title']}' in {$assignment['subject']} ({$assignment['section']}). {$timeAgo}",
            'subject' => $assignment['subject'],
            'section' => $assignment['section'],
            'subject_code' => $assignment['subject_code'],
            'activity_id' => $assignment['activity_id'],
            'activity_type' => $assignment['activity_type'],
            'professor_name' => $assignment['professor_name'],
            'priority' => 2, // Medium priority
            'created_at' => $assignment['created_at'],
            'isRead' => false
        ];
    }
    return $notifications;
}

function getUpcomingDeadlines($pdo, $studentId) {
    // Get activities due in 1 day or today
    $stmt = $pdo->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.activity_type,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code,
            ag.submitted,
            ag.grade
        FROM activities a
        JOIN classes c ON a.subject_code = c.subject_code
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code IN (
            SELECT sc.subject_code 
            FROM student_classes sc 
            WHERE sc.student_ID = ? AND sc.archived = 0
        )
        AND a.archived = 0
        AND a.deadline IS NOT NULL 
        AND a.deadline >= NOW()
        AND a.deadline <= DATE_ADD(NOW(), INTERVAL 1 DAY)
        AND (ag.submitted = 0 OR ag.submitted IS NULL)
    ");
    $stmt->execute([$studentId, $studentId]);
    $deadlines = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($deadlines as $deadline) {
        $daysLeft = date('Y-m-d') == date('Y-m-d', strtotime($deadline['deadline'])) ? 'today' : 'tomorrow';
        $notifications[] = [
            'id' => 'deadline_' . $deadline['activity_id'],
            'type' => 'upcoming_deadline',
            'title' => 'Upcoming Deadline',
            'description' => "{$deadline['activity_type']} '{$deadline['title']}' is due {$daysLeft} in {$deadline['subject']} ({$deadline['section']}). Deadline: " . date('M j, Y g:i A', strtotime($deadline['deadline'])),
            'subject' => $deadline['subject'],
            'section' => $deadline['section'],
            'subject_code' => $deadline['subject_code'],
            'activity_id' => $deadline['activity_id'],
            'due_date' => $deadline['deadline'],
            'priority' => 3, // High priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getAttendanceRisk($pdo, $studentId) {
    // Check for 3+ absences
    $stmt = $pdo->prepare("
        SELECT 
            c.subject,
            c.section,
            c.subject_code,
            SUM(CASE 
                WHEN a.status = 'absent' THEN 1 
                WHEN a.status = 'late' THEN 0.33 
                ELSE 0 
            END) as absence_count
        FROM classes c
        JOIN student_classes sc ON c.subject_code = sc.subject_code
        LEFT JOIN attendance a ON c.subject_code = a.subject_code AND a.student_ID = ?
        WHERE sc.student_ID = ? 
            AND sc.archived = 0
        GROUP BY c.subject_code
        HAVING absence_count >= 3
    ");
    $stmt->execute([$studentId, $studentId]);
    $riskSubjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($riskSubjects as $subject) {
        $notifications[] = [
            'id' => 'attendance_risk_' . $subject['subject_code'],
            'type' => 'attendance_risk',
            'title' => 'Attendance Risk Warning',
            'description' => "You have {$subject['absence_count']} equivalent absences in {$subject['subject']} ({$subject['section']}). You are at risk of being dropped from the class.",
            'subject' => $subject['subject'],
            'section' => $subject['section'],
            'subject_code' => $subject['subject_code'],
            'absence_count' => $subject['absence_count'],
            'priority' => 3, // High priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getLateArrivals($pdo, $studentId) {
    // Check for 3+ late arrivals in any subject
    $stmt = $pdo->prepare("
        SELECT 
            c.subject,
            c.section,
            c.subject_code,
            COUNT(*) as late_count
        FROM attendance a
        JOIN classes c ON a.subject_code = c.subject_code
        WHERE a.student_ID = ? 
            AND a.status = 'late'
        GROUP BY c.subject_code
        HAVING late_count >= 3
    ");
    $stmt->execute([$studentId]);
    $lateSubjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($lateSubjects as $subject) {
        $notifications[] = [
            'id' => 'late_arrival_' . $subject['subject_code'],
            'type' => 'late_arrival',
            'title' => 'Late Arrival Warning',
            'description' => "You have {$subject['late_count']} late arrivals in {$subject['subject']} ({$subject['section']}). Remember that 3 late marks count as 1 absence.",
            'subject' => $subject['subject'],
            'section' => $subject['section'],
            'subject_code' => $subject['subject_code'],
            'late_count' => $subject['late_count'],
            'priority' => 2, // Medium priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getLateActivities($pdo, $studentId) {
    // Check for late or missed activities before deadline passes
    $stmt = $pdo->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.activity_type,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code,
            ag.submitted,
            ag.late,
            ag.submitted_at
        FROM activities a
        JOIN classes c ON a.subject_code = c.subject_code
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code IN (
            SELECT sc.subject_code 
            FROM student_classes sc 
            WHERE sc.student_ID = ? AND sc.archived = 0
        )
        AND a.archived = 0
        AND a.deadline IS NOT NULL 
        AND a.deadline < NOW()
        AND (ag.submitted = 0 OR ag.submitted IS NULL OR ag.late = 1)
    ");
    $stmt->execute([$studentId, $studentId]);
    $lateActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($lateActivities as $activity) {
        if ($activity['submitted'] && $activity['late']) {
            $description = "You submitted '{$activity['title']}' late in {$activity['subject']} ({$activity['section']}). Deadline was: " . date('M j, Y g:i A', strtotime($activity['deadline']));
        } else if (!$activity['submitted']) {
            $description = "You missed the deadline for '{$activity['title']}' in {$activity['subject']} ({$activity['section']}). Deadline was: " . date('M j, Y g:i A', strtotime($activity['deadline']));
        } else {
            continue;
        }
        
        $notifications[] = [
            'id' => 'late_activity_' . $activity['activity_id'],
            'type' => 'late_activity',
            'title' => 'Late/Missed Activity',
            'description' => $description,
            'subject' => $activity['subject'],
            'section' => $activity['section'],
            'subject_code' => $activity['subject_code'],
            'activity_id' => $activity['activity_id'],
            'priority' => 2, // Medium priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getFailingSubjects($pdo, $studentId) {
    // Check for subjects where student has many missed/late activities (indicating potential failure)
    $stmt = $pdo->prepare("
        SELECT 
            c.subject,
            c.section,
            c.subject_code,
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as professor_name,
            COUNT(CASE WHEN (ag.submitted = 0 OR ag.submitted IS NULL) AND a.deadline < NOW() THEN 1 END) as missed_count,
            COUNT(CASE WHEN ag.late = 1 THEN 1 END) as late_count
        FROM classes c
        JOIN student_classes sc ON c.subject_code = sc.subject_code
        JOIN tracked_users t ON c.professor_ID = t.tracked_ID
        LEFT JOIN activities a ON c.subject_code = a.subject_code AND a.archived = 0
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE sc.student_ID = ? 
            AND sc.archived = 0
        GROUP BY c.subject_code
        HAVING (missed_count + late_count) >= 3
    ");
    $stmt->execute([$studentId, $studentId]);
    $failingSubjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($failingSubjects as $subject) {
        $totalIssues = $subject['missed_count'] + $subject['late_count'];
        
        // Build the activity types description
        $activityTypes = [];
        if ($subject['missed_count'] > 0) {
            $activityTypes[] = "missed activities";
        }
        if ($subject['late_count'] > 0) {
            $activityTypes[] = "late submissions";
        }
        
        $activityDescription = implode(", ", $activityTypes);
        
        $notifications[] = [
            'id' => 'failing_subject_' . $subject['subject_code'],
            'type' => 'failing_subject',
            'title' => 'Academic Performance Alert',
            'description' => "Important: You have a lot of {$activityDescription} on this subject {$subject['subject']} ({$subject['subject_code']}). Please contact your professor {$subject['professor_name']}.",
            'subject' => $subject['subject'],
            'section' => $subject['section'],
            'subject_code' => $subject['subject_code'],
            'professor_name' => $subject['professor_name'],
            'missed_count' => $subject['missed_count'],
            'late_count' => $subject['late_count'],
            'priority' => 3, // High priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getTimeAgo($datetime) {
    $time = strtotime($datetime);
    $timeDiff = time() - $time;
    
    if ($timeDiff < 60) {
        return 'just now';
    } elseif ($timeDiff < 3600) {
        $minutes = floor($timeDiff / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($timeDiff < 86400) {
        $hours = floor($timeDiff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } else {
        $days = floor($timeDiff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    }
}
?>