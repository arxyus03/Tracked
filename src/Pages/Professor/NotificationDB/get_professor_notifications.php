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

// Get professor ID from request
$professorId = $_POST['professor_id'] ?? '';

if (empty($professorId)) {
    echo json_encode(['success' => false, 'message' => 'Professor ID is required']);
    exit;
}

try {
    $notifications = [];
    
    // 1. Check for ungraded activities with approaching deadlines (1 day before)
    $ungradedActivities = getUngradedActivities($pdo, $professorId);
    $notifications = array_merge($notifications, $ungradedActivities);
    
    // 2. Check for students with 3+ absences
    $riskStudents = getAtRiskStudents($pdo, $professorId);
    $notifications = array_merge($notifications, $riskStudents);
    
    // 3. Check for students failing the subject
    $failingStudents = getFailingStudents($pdo, $professorId);
    $notifications = array_merge($notifications, $failingStudents);
    
    // 4. Check for due date reminders (1 day before or same day)
    $dueDateReminders = getDueDateReminders($pdo, $professorId);
    $notifications = array_merge($notifications, $dueDateReminders);
    
    // 5. Check for new student enrollments
    $newStudents = getNewStudentEnrollments($pdo, $professorId);
    $notifications = array_merge($notifications, $newStudents);
    
    // Sort notifications by priority and date
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

function getUngradedActivities($pdo, $professorId) {
    $stmt = $pdo->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code,
            COUNT(ag.student_ID) as ungraded_count
        FROM activities a
        JOIN classes c ON a.subject_code = c.subject_code
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.grade IS NULL
        WHERE c.professor_ID = ? 
            AND a.deadline IS NOT NULL 
            AND a.deadline >= NOW()
            AND a.deadline <= DATE_ADD(NOW(), INTERVAL 1 DAY)
            AND a.archived = 0
        GROUP BY a.id
        HAVING ungraded_count > 0
    ");
    $stmt->execute([$professorId]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($activities as $activity) {
        $notifications[] = [
            'id' => 'ungraded_' . $activity['activity_id'],
            'type' => 'ungraded_activity',
            'title' => 'Ungraded Activity - Deadline Approaching',
            'description' => "You have {$activity['ungraded_count']} ungraded submission(s) for '{$activity['title']}' in {$activity['subject']} ({$activity['section']}). Deadline: " . date('M j, Y g:i A', strtotime($activity['deadline'])),
            'subject' => $activity['subject'],
            'section' => $activity['section'],
            'subject_code' => $activity['subject_code'],
            'activity_id' => $activity['activity_id'],
            'priority' => 3, // High priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getAtRiskStudents($pdo, $professorId) {
    $stmt = $pdo->prepare("
        SELECT 
            c.subject,
            c.section,
            c.subject_code,
            tu.tracked_ID as student_id,
            CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as student_name,
            SUM(CASE 
                WHEN a.status = 'absent' THEN 1 
                WHEN a.status = 'late' THEN 0.33 
                ELSE 0 
            END) as absence_count
        FROM classes c
        JOIN student_classes sc ON c.subject_code = sc.subject_code
        JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID
        LEFT JOIN attendance a ON c.subject_code = a.subject_code AND tu.tracked_ID = a.student_ID
        WHERE c.professor_ID = ? 
            AND sc.archived = 0
        GROUP BY c.subject_code, tu.tracked_ID
        HAVING absence_count >= 3
    ");
    $stmt->execute([$professorId]);
    $riskStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($riskStudents as $student) {
        $notifications[] = [
            'id' => 'risk_' . $student['student_id'] . '_' . $student['subject_code'],
            'type' => 'at_risk_student',
            'title' => 'Student At Risk of Being Dropped',
            'description' => "{$student['student_name']} has {$student['absence_count']} equivalent absences in {$student['subject']} ({$student['section']}).",
            'subject' => $student['subject'],
            'section' => $student['section'],
            'subject_code' => $student['subject_code'],
            'student_id' => $student['student_id'],
            'student_name' => $student['student_name'],
            'absence_count' => $student['absence_count'],
            'priority' => 2, // Medium priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getFailingStudents($pdo, $professorId) {
    $stmt = $pdo->prepare("
        SELECT 
            c.subject,
            c.section,
            c.subject_code,
            tu.tracked_ID as student_id,
            CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as student_name,
            AVG(ag.grade) as average_grade
        FROM classes c
        JOIN student_classes sc ON c.subject_code = sc.subject_code
        JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID
        LEFT JOIN activity_grades ag ON sc.student_ID = ag.student_ID 
        LEFT JOIN activities act ON ag.activity_ID = act.id AND act.subject_code = c.subject_code
        WHERE c.professor_ID = ? 
            AND sc.archived = 0
            AND ag.grade IS NOT NULL
        GROUP BY c.subject_code, tu.tracked_ID
        HAVING average_grade < 75
    ");
    $stmt->execute([$professorId]);
    $failingStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($failingStudents as $student) {
        $notifications[] = [
            'id' => 'failing_' . $student['student_id'] . '_' . $student['subject_code'],
            'type' => 'failing_student',
            'title' => 'Student Failing Subject',
            'description' => "Important: You have a student in {$student['subject']} ({$student['subject_code']}) that is failing. Please contact them.",
            'subject' => $student['subject'],
            'section' => $student['section'],
            'subject_code' => $student['subject_code'],
            'student_id' => $student['student_id'],
            'student_name' => $student['student_name'],
            'average_grade' => $student['average_grade'],
            'priority' => 2, // Medium priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    return $notifications;
}

function getDueDateReminders($pdo, $professorId) {
    // Activities due in 1 day or today
    $stmt = $pdo->prepare("
        SELECT 
            a.id as activity_id,
            a.title,
            a.deadline,
            a.activity_type,
            c.subject,
            c.section,
            c.subject_code
        FROM activities a
        JOIN classes c ON a.subject_code = c.subject_code
        WHERE c.professor_ID = ? 
            AND a.deadline IS NOT NULL 
            AND a.archived = 0
            AND (
                DATE(a.deadline) = CURDATE() 
                OR DATE(a.deadline) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            )
    ");
    $stmt->execute([$professorId]);
    $dueActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($dueActivities as $activity) {
        $daysLeft = date('Y-m-d') == date('Y-m-d', strtotime($activity['deadline'])) ? 'today' : 'tomorrow';
        $notifications[] = [
            'id' => 'due_' . $activity['activity_id'],
            'type' => 'due_date_reminder',
            'title' => 'Due Date Reminder',
            'description' => "{$activity['activity_type']} '{$activity['title']}' is due {$daysLeft} in {$activity['subject']} ({$activity['section']}). Deadline: " . date('M j, Y g:i A', strtotime($activity['deadline'])),
            'subject' => $activity['subject'],
            'section' => $activity['section'],
            'subject_code' => $activity['subject_code'],
            'activity_id' => $activity['activity_id'],
            'due_date' => $activity['deadline'],
            'priority' => 1, // Normal priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    
    // Announcements with deadlines
    $stmt = $pdo->prepare("
        SELECT 
            a.announcement_ID,
            a.title,
            a.deadline,
            c.subject,
            c.section,
            c.subject_code
        FROM announcements a
        JOIN classes c ON a.classroom_ID = c.subject_code
        WHERE c.professor_ID = ? 
            AND a.deadline IS NOT NULL 
            AND (
                DATE(a.deadline) = CURDATE() 
                OR DATE(a.deadline) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            )
    ");
    $stmt->execute([$professorId]);
    $dueAnnouncements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($dueAnnouncements as $announcement) {
        $daysLeft = date('Y-m-d') == date('Y-m-d', strtotime($announcement['deadline'])) ? 'today' : 'tomorrow';
        $notifications[] = [
            'id' => 'announcement_due_' . $announcement['announcement_ID'],
            'type' => 'announcement_reminder',
            'title' => 'Announcement Deadline Reminder',
            'description' => "Announcement '{$announcement['title']}' has a deadline {$daysLeft} in {$announcement['subject']} ({$announcement['section']}). Deadline: " . date('M j, Y g:i A', strtotime($announcement['deadline'])),
            'subject' => $announcement['subject'],
            'section' => $announcement['section'],
            'subject_code' => $announcement['subject_code'],
            'announcement_id' => $announcement['announcement_ID'],
            'due_date' => $announcement['deadline'],
            'priority' => 1, // Normal priority
            'created_at' => date('Y-m-d H:i:s'),
            'isRead' => false
        ];
    }
    
    return $notifications;
}

function getNewStudentEnrollments($pdo, $professorId) {
    // Get students who joined in the last 7 days
    $stmt = $pdo->prepare("
        SELECT 
            sc.student_ID,
            CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as student_name,
            c.subject,
            c.section,
            c.subject_code,
            sc.enrolled_at
        FROM student_classes sc
        JOIN classes c ON sc.subject_code = c.subject_code
        JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID
        WHERE c.professor_ID = ? 
            AND sc.archived = 0
            AND sc.enrolled_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY sc.enrolled_at DESC
    ");
    $stmt->execute([$professorId]);
    $newStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notifications = [];
    foreach ($newStudents as $student) {
        $timeAgo = getTimeAgo($student['enrolled_at']);
        $notifications[] = [
            'id' => 'new_student_' . $student['student_ID'] . '_' . $student['subject_code'],
            'type' => 'new_student',
            'title' => 'New Student Joined Class',
            'description' => "{$student['student_name']} joined {$student['subject']} ({$student['section']}) {$timeAgo}.",
            'subject' => $student['subject'],
            'section' => $student['section'],
            'subject_code' => $student['subject_code'],
            'student_id' => $student['student_ID'],
            'student_name' => $student['student_name'],
            'enrolled_at' => $student['enrolled_at'],
            'priority' => 0, // Low priority
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