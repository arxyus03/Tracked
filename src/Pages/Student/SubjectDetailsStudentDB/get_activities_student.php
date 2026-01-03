<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set database connection to UTC timezone
    $pdo->exec("SET time_zone = '+00:00'");
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Include PHPMailer for email notifications
require_once __DIR__ . '/../../Landing/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../../Landing/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../../Landing/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$subject_code = $_GET['subject_code'] ?? '';
$student_id = $_GET['student_id'] ?? '';

if (empty($subject_code) || empty($student_id)) {
    echo json_encode(["success" => false, "message" => "Subject code and Student ID are required"]);
    exit;
}

try {
    // Check if student is enrolled in this class
    $enrollmentStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ?");
    $enrollmentStmt->execute([$student_id, $subject_code]);
    $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$enrollment) {
        echo json_encode(["success" => false, "message" => "Student not enrolled in this class"]);
        exit;
    }

    // Get student info
    $studentStmt = $pdo->prepare("
        SELECT tracked_ID, tracked_email, CONCAT(tracked_firstname, ' ', tracked_lastname) as student_name
        FROM tracked_users 
        WHERE tracked_ID = ?
    ");
    $studentStmt->execute([$student_id]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    // Get class info
    $classStmt = $pdo->prepare("
        SELECT subject as subject_name, section 
        FROM classes 
        WHERE subject_code = ?
    ");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    // Get activities for this subject with UTC formatted timestamps, grade, and professor files info
    // UPDATED: Added school_work_edited field to the SELECT query
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.subject_code,
            a.activity_type,
            a.task_number,
            a.title,
            a.instruction,
            a.link,
            a.points,
            a.school_work_edited,
            DATE_FORMAT(a.deadline, '%Y-%m-%dT%H:%i:%sZ') as deadline,
            DATE_FORMAT(a.created_at, '%Y-%m-%dT%H:%i:%sZ') as created_at,
            DATE_FORMAT(a.updated_at, '%Y-%m-%dT%H:%i:%sZ') as updated_at,
            COALESCE(ag.submitted, 0) as submitted,
            DATE_FORMAT(ag.submitted_at, '%Y-%m-%dT%H:%i:%sZ') as submitted_at,
            ag.grade,
            ag.late,
            ag.uploaded_file_url as professor_file_url,
            ag.uploaded_file_name as professor_file_name,
            CASE 
                WHEN COALESCE(ag.submitted, 0) = 0 AND a.deadline IS NOT NULL AND a.deadline < UTC_TIMESTAMP() THEN 1
                ELSE 0
            END as missing,
            -- Check if professor has uploaded files for this student
            (
                SELECT COUNT(*) 
                FROM activity_files af 
                WHERE af.activity_id = a.id 
                AND af.student_id = ? 
                AND af.uploaded_by = 'professor'
            ) as professor_file_count
        FROM activities a 
        LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
        WHERE a.subject_code = ? AND (a.archived = 0 OR a.archived IS NULL)
        ORDER BY a.created_at DESC
    ");
    $stmt->execute([$student_id, $student_id, $subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $emailNotifications = [];

    // Check each activity for notification conditions
    foreach ($activities as $activity) {
        // Check notification history for this student and activity
        $notificationHistoryStmt = $pdo->prepare("
            SELECT notification_type, last_notified_at 
            FROM activity_notification_history 
            WHERE student_id = ? AND activity_id = ?
        ");
        $notificationHistoryStmt->execute([$student_id, $activity['id']]);
        $notificationHistory = $notificationHistoryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Create a map of notification types and their last sent times
        $lastNotifications = [];
        foreach ($notificationHistory as $history) {
            $lastNotifications[$history['notification_type']] = strtotime($history['last_notified_at']);
        }

        // Helper function to check if notification should be sent
        $shouldSendNotification = function($notificationType) use ($lastNotifications) {
            // If never sent before, send it
            if (!isset($lastNotifications[$notificationType])) {
                return true;
            }
            
            // Check if 3 days (259200 seconds) have passed since last notification
            $currentTime = time();
            $lastNotifiedTime = $lastNotifications[$notificationType];
            $timeDiff = $currentTime - $lastNotifiedTime;
            
            return $timeDiff >= 259200; // 3 days in seconds
        };

        // Helper function to update notification history
        $updateNotificationHistory = function($activityId, $studentId, $notificationType) use ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO activity_notification_history 
                (student_id, activity_id, notification_type, last_notified_at) 
                VALUES (?, ?, ?, UTC_TIMESTAMP())
                ON DUPLICATE KEY UPDATE last_notified_at = UTC_TIMESTAMP()
            ");
            $stmt->execute([$studentId, $activityId, $notificationType]);
        };

        // 1. Check if activity is missed (deadline passed and not submitted)
        if ($activity['missing'] == 1 && $activity['submitted'] == 0) {
            if ($shouldSendNotification("MISSED_ACTIVITY")) {
                $emailSent = sendSchoolWorksNotification(
                    $student['tracked_email'],
                    $student['student_name'],
                    $class['subject_name'],
                    $class['section'],
                    $activity['activity_type'],
                    $activity['task_number'],
                    $activity['title'],
                    $activity['deadline'],
                    "MISSED_ACTIVITY"
                );
                if ($emailSent) {
                    $updateNotificationHistory($activity['id'], $student_id, "MISSED_ACTIVITY");
                    $emailNotifications[] = [
                        'activity_id' => $activity['id'],
                        'type' => 'missed_activity',
                        'status' => 'sent'
                    ];
                }
            }
        }

        // 2. Check if activity is submitted (recently submitted - within last 5 minutes)
        if ($activity['submitted'] == 1 && $activity['submitted_at']) {
            $submittedTime = strtotime($activity['submitted_at']);
            $currentTime = time();
            $timeDiff = $currentTime - $submittedTime;
            
            // Only send notification if submitted within the last 5 minutes (300 seconds)
            if ($timeDiff <= 300) {
                // For submitted notifications, we want to send them immediately, not wait 3 days
                // But we should still check if we've sent one recently to avoid duplicates
                if (!isset($lastNotifications["ACTIVITY_SUBMITTED"]) || 
                    (time() - $lastNotifications["ACTIVITY_SUBMITTED"]) >= 300) { // 5 minutes
                    
                    $emailSent = sendSchoolWorksNotification(
                        $student['tracked_email'],
                        $student['student_name'],
                        $class['subject_name'],
                        $class['section'],
                        $activity['activity_type'],
                        $activity['task_number'],
                        $activity['title'],
                        $activity['deadline'],
                        "ACTIVITY_SUBMITTED"
                    );
                    if ($emailSent) {
                        $updateNotificationHistory($activity['id'], $student_id, "ACTIVITY_SUBMITTED");
                        $emailNotifications[] = [
                            'activity_id' => $activity['id'],
                            'type' => 'activity_submitted',
                            'status' => 'sent'
                        ];
                    }
                }
            }
        }

        // 3. Check if deadline is approaching (within 24 hours) - WITH 3-DAY COOLDOWN
        if ($activity['deadline'] && $activity['deadline'] !== 'No deadline' && $activity['submitted'] == 0) {
            $deadlineTime = strtotime($activity['deadline']);
            $currentTime = time();
            $timeDiff = $deadlineTime - $currentTime;
            
            // Check if deadline is within 24 hours (86400 seconds) and not passed yet
            if ($timeDiff > 0 && $timeDiff <= 86400) {
                if ($shouldSendNotification("DEADLINE_APPROACHING")) {
                    $emailSent = sendSchoolWorksNotification(
                        $student['tracked_email'],
                        $student['student_name'],
                        $class['subject_name'],
                        $class['section'],
                        $activity['activity_type'],
                        $activity['task_number'],
                        $activity['title'],
                        $activity['deadline'],
                        "DEADLINE_APPROACHING"
                    );
                    
                    if ($emailSent) {
                        $updateNotificationHistory($activity['id'], $student_id, "DEADLINE_APPROACHING");
                        $emailNotifications[] = [
                            'activity_id' => $activity['id'],
                            'type' => 'deadline_approaching',
                            'status' => 'sent'
                        ];
                    }
                }
            }
        }
    }

    echo json_encode([
        "success" => true,
        "activities" => $activities,
        "email_notifications" => $emailNotifications
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching activities: " . $e->getMessage()]);
}

// Function to send school works notifications
function sendSchoolWorksNotification($studentEmail, $studentName, $subjectName, $section, $activityType, $taskNumber, $activityTitle, $deadline, $notificationType) {
    try {
        $mail = new PHPMailer(true);

        // SMTP configuration
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'tracked.0725@gmail.com';
        $mail->Password = 'nmvi itzx dqrh qimh';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->SMTPDebug = 0;

        // Sender and recipient
        $mail->setFrom('tracked.0725@gmail.com', 'TrackEd System');
        $mail->addAddress($studentEmail, $studentName);
        $mail->addReplyTo('tracked.0725@gmail.com', 'TrackEd System');

        // Format deadline for display
        $formattedDeadline = "No deadline";
        if ($deadline && $deadline !== "No deadline") {
            try {
                $deadlineDate = new DateTime($deadline);
                $formattedDeadline = $deadlineDate->format('F j, Y \a\t g:i A');
            } catch (Exception $e) {
                $formattedDeadline = $deadline;
            }
        }

        // Email content based on notification type
        switch ($notificationType) {
            case "MISSED_ACTIVITY":
                $subject = "Activity Missed: $activityType #$taskNumber - $subjectName ($section)";
                $title = "Activity Missed";
                $message = "You missed the deadline for \"$activityTitle\" ($activityType #$taskNumber) in $subjectName ($section).\n\n"
                    . "• Activity: $activityTitle\n"
                    . "• Type: $activityType #$taskNumber\n"
                    . "• Deadline: $formattedDeadline\n\n"
                    . "**Action Required**: Please contact your professor as soon as possible to discuss if there are any options for late submission or alternative arrangements.\n\n"
                    . "Note: This activity is now marked as \"Missed\" in your School Works.";
                break;
                
            case "ACTIVITY_SUBMITTED":
                $subject = "Activity Submitted: $activityType #$taskNumber - $subjectName ($section)";
                $title = "Activity Successfully Submitted";
                $message = "Great job! You have successfully submitted \"$activityTitle\" ($activityType #$taskNumber) in $subjectName ($section).\n\n"
                    . "• Activity: $activityTitle\n"
                    . "• Type: $activityType #$taskNumber\n"
                    . "• Submission Time: " . date('F j, Y \a\t g:i A') . "\n"
                    . ($deadline && $deadline !== "No deadline" ? "• Deadline: $formattedDeadline\n" : "")
                    . "\n**Status**: Your submission has been recorded and is now awaiting grading.\n\n"
                    . "You can view your submission in the School Works section of TrackEd.";
                break;
                
            case "DEADLINE_APPROACHING":
                $subject = "Deadline Approaching: $activityType #$taskNumber - $subjectName ($section)";
                $title = "Deadline Approaching";
                $message = "Reminder: The deadline for \"$activityTitle\" ($activityType #$taskNumber) in $subjectName ($section) is approaching.\n\n"
                    . "• Activity: $activityTitle\n"
                    . "• Type: $activityType #$taskNumber\n"
                    . "• Deadline: $formattedDeadline\n\n"
                    . "**Urgent**: The deadline is within 24 hours. Please submit your work as soon as possible to avoid missing the deadline.\n\n"
                    . "You can submit your work through the School Works section in TrackEd.";
                break;
                
            default:
                return false;
        }

        // Build HTML email body
        $htmlBody = buildSchoolWorksEmailBody($studentName, $title, $message, $notificationType);
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        $mail->AltBody = strip_tags($message);

        return $mail->send();
    } catch (Exception $e) {
        error_log("Email sending failed for $studentEmail: " . $e->getMessage());
        return false;
    }
}

// Function to build HTML email body for school works notifications
function buildSchoolWorksEmailBody($studentName, $title, $message, $notificationType) {
    // Set color based on notification type
    switch ($notificationType) {
        case "MISSED_ACTIVITY":
            $color = '#d9534f'; // Red
            $icon = '⚠️';
            break;
        case "ACTIVITY_SUBMITTED":
            $color = '#00A15D'; // Green
            $icon = '✅';
            break;
        case "DEADLINE_APPROACHING":
            $color = '#f0ad4e'; // Orange
            $icon = '⏰';
            break;
        default:
            $color = '#767EE0'; // Blue
            $icon = '📚';
    }

    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TrackEd School Works Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
            }
            .header {
                background-color: ' . $color . ';
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 30px;
                background-color: #f8f9fa;
                border-radius: 0 0 8px 8px;
                border-left: 4px solid ' . $color . ';
            }
            .warning-box {
                background-color: #fff8e6;
                border-left: 4px solid #f0ad4e;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .success-box {
                background-color: #e8f5e8;
                border-left: 4px solid #00A15D;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .critical-box {
                background-color: #f8d7da;
                border-left: 4px solid #d9534f;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
                text-align: center;
            }
            .action-box {
                background-color: ' . $color . '10;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                border-left: 4px solid ' . $color . ';
            }
            h1 {
                margin: 0;
                font-size: 24px;
            }
            h2 {
                color: ' . $color . ';
                margin-top: 0;
            }
            p {
                margin-bottom: 15px;
            }
            .stats {
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
            }
            .action-button {
                display: inline-block;
                background-color: ' . $color . ';
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 10px;
            }
            .icon-large {
                font-size: 48px;
                text-align: center;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>' . $icon . ' TrackEd School Works</h1>
            </div>
            
            <div class="content">
                <p>Hi <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
                
                <h2>' . htmlspecialchars($title) . '</h2>
                
                <div class="stats">
                    ' . nl2br(htmlspecialchars($message)) . '
                </div>';
    
    // Add specific action boxes based on notification type
    if ($notificationType === "MISSED_ACTIVITY") {
        $html .= '
                <div class="critical-box">
                    <p><strong>🚨 Immediate Action Required:</strong></p>
                    <p>• Contact your professor <strong>as soon as possible</strong></p>
                    <p>• Explain your situation clearly</p>
                    <p>• Ask about possible late submission options</p>
                    <p>• Inquire about alternative arrangements if available</p>
                </div>';
    }
    
    if ($notificationType === "ACTIVITY_SUBMITTED") {
        $html .= '
                <div class="success-box">
                    <p><strong>✅ Next Steps:</strong></p>
                    <p>• Your submission is now awaiting grading</p>
                    <p>• Check back later for your grade and feedback</p>
                    <p>• Continue working on other pending activities</p>
                    <p>• Monitor your TrackEd dashboard for updates</p>
                </div>';
    }
    
    if ($notificationType === "DEADLINE_APPROACHING") {
        $html .= '
                <div class="warning-box">
                    <p><strong>⏰ Urgent Deadline Reminder:</strong></p>
                    <p>• Submit your work <strong>as soon as possible</strong></p>
                    <p>• Double-check all requirements before submission</p>
                    <p>• Make sure your file is properly uploaded</p>
                    <p>• Click "Mark as Submitted" to complete the process</p>
                </div>';
    }
    
    $html .= '
                <div class="action-box">
                    <p><strong>📱 TrackEd Access:</strong></p>
                    <p>Log in to your TrackEd account to:</p>
                    <p>• View all your school works</p>
                    <p>• Check submission status</p>
                    <p>• See grades and feedback</p>
                    <p>• Monitor upcoming deadlines</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated notification from the TrackEd System.</p>
                    <p>Please do not reply to this email.</p>
                    <p>For questions or concerns, please contact your professor directly.</p>
                </div>
            </div>
        </div>
    </body>
    </html>';
    
    return $html;
}
?>