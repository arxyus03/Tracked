<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Set timezone to match your location (Philippines)
date_default_timezone_set('Asia/Manila');

$host = 'localhost';
$dbname = 'u7 3320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$student_id = $_GET['student_id'] ?? '';
$subject_code = $_GET['subject_code'] ?? '';

if (empty($student_id) || empty($subject_code)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Student ID and Subject code are required"]);
    exit;
}

// Include PHPMailer for email notifications
require_once __DIR__ . '/../../Landing/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../../Landing/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../../Landing/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    // Verify student is enrolled in this class
    $enrollmentStmt = $pdo->prepare("
        SELECT * FROM student_classes 
        WHERE student_ID = ? AND subject_code = ? AND archived = 0
    ");
    $enrollmentStmt->execute([$student_id, $subject_code]);
    $enrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$enrollment) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student not enrolled in this class"]);
        exit;
    }

    // Get class info
    $classStmt = $pdo->prepare("
        SELECT subject as subject_name, section FROM classes WHERE subject_code = ?
    ");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    // Get student info
    $studentStmt = $pdo->prepare("
        SELECT tracked_ID, tracked_email, CONCAT(tracked_firstname, ' ', tracked_lastname) as user_name
        FROM tracked_users 
        WHERE tracked_ID = ?
    ");
    $studentStmt->execute([$student_id]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    // Get all distinct attendance dates for this subject
    $datesStmt = $pdo->prepare("
        SELECT DISTINCT attendance_date 
        FROM attendance 
        WHERE subject_code = ? 
        ORDER BY attendance_date DESC
    ");
    $datesStmt->execute([$subject_code]);
    $dates = $datesStmt->fetchAll(PDO::FETCH_ASSOC);

    $attendance_history = [];
    $absent_dates = [];
    $late_dates = [];

    foreach ($dates as $date_record) {
        $attendance_date = $date_record['attendance_date'];
        
        // Get this student's attendance for this date WITH CREATED_AT TIME
        $attendanceStmt = $pdo->prepare("
            SELECT status, created_at 
            FROM attendance 
            WHERE student_ID = ? AND subject_code = ? AND attendance_date = ?
        ");
        $attendanceStmt->execute([$student_id, $subject_code, $attendance_date]);
        $attendance_record = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
        
        $status = $attendance_record ? $attendance_record['status'] : 'absent';
        $created_at = $attendance_record ? $attendance_record['created_at'] : null;
        
        // Track dates for absent and late
        if ($status === 'absent') {
            $absent_dates[] = $attendance_date;
        } elseif ($status === 'late') {
            $late_dates[] = $attendance_date;
        }
        
        // Format date for display - use Asia/Manila timezone
        $date_obj = new DateTime($attendance_date, new DateTimeZone('Asia/Manila'));
        $formatted_date = $date_obj->format('F j, Y');
        
        // Format the time - convert created_at to Asia/Manila timezone
        $marked_time = null;
        if ($created_at) {
            try {
                // Parse the created_at timestamp
                $created_at_obj = new DateTime($created_at, new DateTimeZone('UTC'));
                
                // Convert to Asia/Manila timezone
                $created_at_obj->setTimezone(new DateTimeZone('Asia/Manila'));
                
                // Format the time portion
                $marked_time = $created_at_obj->format('g:i A');
                
                // Also store the full datetime for debugging
                $full_datetime = $created_at_obj->format('Y-m-d H:i:s');
                
            } catch (Exception $e) {
                // Fallback to simple formatting if DateTime fails
                $marked_time = date('g:i A', strtotime($created_at));
            }
        }
        
        $attendance_history[] = [
            "date" => $formatted_date,
            "raw_date" => $attendance_date,
            "status" => $status,
            "created_at" => $created_at,
            "marked_time" => $marked_time,
            "full_datetime" => $full_datetime ?? null
        ];
    }

    // Calculate totals
    $present = 0;
    $late = 0;
    $absent = 0;
    
    foreach ($attendance_history as $record) {
        switch ($record['status']) {
            case 'present':
                $present++;
                break;
            case 'late':
                $late++;
                break;
            case 'absent':
                $absent++;
                break;
        }
    }
    
    $total = count($attendance_history);
    
    // Calculate attendance warnings and send notifications
    $equivalentAbsents = floor($late / 3);
    $remainingLates = $late % 3;
    $totalEffectiveAbsents = $absent + $equivalentAbsents;
    
    $warnings = [];
    $emailNotifications = [];
    
    // 1. Check for 2 late marks (close to becoming absent)
    if ($late == 2) {
        $warnings[] = "warning_2_lates";
        if ($remainingLates == 2 && $equivalentAbsents == 0) {
            // Send email for 2 lates
            $emailSent = sendAttendanceWarningEmail(
                $student['tracked_email'],
                $student['user_name'],
                $class['subject_name'],
                $class['section'],
                $late,
                $absent,
                $totalEffectiveAbsents,
                "TWO_LATES_WARNING"
            );
            if ($emailSent) {
                $emailNotifications[] = "two_lates_warning_sent";
            }
        }
    }
    
    // 2. Check for 2 absents (close to being dropped)
    if ($absent == 2) {
        $warnings[] = "warning_2_absents";
        // Send email for 2 absents
        $emailSent = sendAttendanceWarningEmail(
            $student['tracked_email'],
            $student['user_name'],
            $class['subject_name'],
            $class['section'],
            $late,
            $absent,
            $totalEffectiveAbsents,
            "TWO_ABSENTS_WARNING"
        );
        if ($emailSent) {
            $emailNotifications[] = "two_absents_warning_sent";
        }
    }
    
    // 3. Check for 3 late marks (equivalent to 1 absent)
    if ($late == 3) {
        $warnings[] = "warning_3_lates";
        if ($equivalentAbsents == 1 && $remainingLates == 0) {
            // Send email for 3 lates = 1 absent
            $emailSent = sendAttendanceWarningEmail(
                $student['tracked_email'],
                $student['user_name'],
                $class['subject_name'],
                $class['section'],
                $late,
                $absent,
                $totalEffectiveAbsents,
                "THREE_LATES_WARNING"
            );
            if ($emailSent) {
                $emailNotifications[] = "three_lates_warning_sent";
            }
        }
    }
    
    // 4. Check for 3 absents (considered dropped)
    if ($absent >= 3) {
        $warnings[] = "warning_dropped";
        // Send email for dropped status
        $emailSent = sendAttendanceWarningEmail(
            $student['tracked_email'],
            $student['user_name'],
            $class['subject_name'],
            $class['section'],
            $late,
            $absent,
            $totalEffectiveAbsents,
            "DROPPED_WARNING"
        );
        if ($emailSent) {
            $emailNotifications[] = "dropped_warning_sent";
        }
    }
    
    // Format dates for display
    $formatted_absent_dates = array_map(function($date) {
        $date_obj = new DateTime($date, new DateTimeZone('Asia/Manila'));
        return $date_obj->format('F j, Y');
    }, $absent_dates);
    
    $formatted_late_dates = array_map(function($date) {
        $date_obj = new DateTime($date, new DateTimeZone('Asia/Manila'));
        return $date_obj->format('F j, Y');
    }, $late_dates);

    echo json_encode([
        "success" => true,
        "student" => [
            "id" => $student['tracked_ID'],
            "name" => $student['user_name'],
            "email" => $student['tracked_email']
        ],
        "class" => [
            "subject_code" => $subject_code,
            "subject_name" => $class['subject_name'],
            "section" => $class['section']
        ],
        "attendance_summary" => [
            "present" => $present,
            "late" => $late,
            "absent" => $absent,
            "total" => $total,
            "equivalent_absents" => $equivalentAbsents,
            "remaining_lates" => $remainingLates,
            "total_effective_absents" => $totalEffectiveAbsents
        ],
        "attendance_dates" => [
            "absent" => $formatted_absent_dates,
            "late" => $formatted_late_dates
        ],
        "attendance_history" => $attendance_history,
        "warnings" => $warnings,
        "email_notifications" => $emailNotifications,
        "timezone_info" => [
            "server_timezone" => date_default_timezone_get(),
            "display_timezone" => "Asia/Manila (PHT)"
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error fetching attendance history: " . $e->getMessage()]);
}

// Function to send attendance warning emails
function sendAttendanceWarningEmail($studentEmail, $studentName, $subjectName, $section, $lateCount, $absentCount, $totalEffectiveAbsents, $warningType) {
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

        // Email content based on warning type
        switch ($warningType) {
            case "TWO_LATES_WARNING":
                $subject = "Attendance Warning: 2 Late Marks - $subjectName ($section)";
                $title = "⚠️ 2 Late Marks Recorded";
                $message = "You currently have 2 late marks in $subjectName ($section).\n\n"
                    . "• Late Count: $lateCount\n"
                    . "• Absent Count: $absentCount\n"
                    . "• Total Effective Absents: $totalEffectiveAbsents\n\n"
                    . "**Important**: 3 late marks = 1 absent. You're close to accumulating an absent.\n\n"
                    . "Please make an effort to arrive on time for your classes.";
                break;
                
            case "TWO_ABSENTS_WARNING":
                $subject = "Attendance Warning: 2 Absents - $subjectName ($section)";
                $title = "⚠️ 2 Absents Recorded";
                $message = "You currently have 2 absents in $subjectName ($section).\n\n"
                    . "• Late Count: $lateCount\n"
                    . "• Absent Count: $absentCount\n"
                    . "• Total Effective Absents: $totalEffectiveAbsents\n\n"
                    . "**Critical**: 3 accumulated absents will result in being dropped from the class.\n\n"
                    . "Please coordinate with your professor regarding your attendance status.";
                break;
                
            case "THREE_LATES_WARNING":
                $subject = "Attendance Notice: 3 Late Marks = 1 Absent - $subjectName ($section)";
                $title = "📊 3 Late Marks Converted to 1 Absent";
                $message = "You have accumulated 3 late marks in $subjectName ($section), which is equivalent to 1 absent.\n\n"
                    . "• Late Count: $lateCount\n"
                    . "• Absent Count: $absentCount\n"
                    . "• Total Effective Absents: $totalEffectiveAbsents\n\n"
                    . "**Recommendation**: Please talk to your professor to discuss your attendance situation and explore possible solutions.\n\n"
                    . "This is an automated conversion based on the attendance policy.";
                break;
                
            case "DROPPED_WARNING":
                $subject = "URGENT: Attendance Status - $subjectName ($section)";
                $title = "🚨 3 Absents Reached - Droppable Status";
                $message = "You have reached 3 or more effective absents in $subjectName ($section).\n\n"
                    . "• Late Count: $lateCount\n"
                    . "• Absent Count: $absentCount\n"
                    . "• Total Effective Absents: $totalEffectiveAbsents\n\n"
                    . "**URGENT ACTION REQUIRED**: According to the attendance policy, 3 accumulated absents may result in being dropped from the class.\n\n"
                    . "**Recommended Solution**: Immediately talk to your professor to discuss possible changes to your attendance status or explore options for recovery.\n\n"
                    . "This is a critical situation that requires immediate attention.";
                break;
                
            default:
                return false;
        }

        // Build HTML email body
        $htmlBody = buildAttendanceEmailBody($studentName, $title, $message, $warningType);
        
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

// Function to build HTML email body for attendance warnings
function buildAttendanceEmailBody($studentName, $title, $message, $warningType) {
    // Set color based on warning type
    switch ($warningType) {
        case "TWO_LATES_WARNING":
            $color = '#f0ad4e'; // Orange
            $icon = '⚠️';
            break;
        case "TWO_ABSENTS_WARNING":
            $color = '#d9534f'; // Red
            $icon = '⚠️';
            break;
        case "THREE_LATES_WARNING":
            $color = '#5bc0de'; // Blue
            $icon = '📊';
            break;
        case "DROPPED_WARNING":
            $color = '#d9534f'; // Red
            $icon = '🚨';
            break;
        default:
            $color = '#00A15D'; // Green
            $icon = '📚';
    }

    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TrackEd Attendance Notification</title>
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
            .policy {
                background-color: #e8f5e8;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                border-left: 4px solid #00A15D;
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>' . $icon . ' TrackEd Attendance Notification</h1>
            </div>
            
            <div class="content">
                <p>Hi <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
                
                <h2>' . htmlspecialchars($title) . '</h2>
                
                <div class="stats">
                    ' . nl2br(htmlspecialchars($message)) . '
                </div>';
    
    // Add specific action boxes based on warning type
    if ($warningType === "TWO_LATES_WARNING") {
        $html .= '
                <div class="warning-box">
                    <p><strong>💡 Recommended Action:</strong></p>
                    <p>• Make sure to arrive on time for future classes</p>
                    <p>• Consider setting multiple alarms</p>
                    <p>• Plan your commute with extra time</p>
                </div>';
    }
    
    if ($warningType === "TWO_ABSENTS_WARNING") {
        $html .= '
                <div class="warning-box">
                    <p><strong>💡 Recommended Action:</strong></p>
                    <p>• Contact your professor immediately</p>
                    <p>• Provide valid reasons for your absents</p>
                    <p>• Request for possible make-up activities</p>
                </div>';
    }
    
    if ($warningType === "THREE_LATES_WARNING") {
        $html .= '
                <div class="warning-box">
                    <p><strong>💡 Recommended Action:</strong></p>
                    <p>• Schedule a meeting with your professor</p>
                    <p>• Discuss your time management challenges</p>
                    <p>• Explore solutions to improve punctuality</p>
                </div>';
    }
    
    if ($warningType === "DROPPED_WARNING") {
        $html .= '
                <div class="critical-box">
                    <p><strong>🚨 URGENT ACTION REQUIRED:</strong></p>
                    <p>• Contact your professor <strong>TODAY</strong></p>
                    <p>• Prepare valid documentation for your absents</p>
                    <p>• Discuss possible remediation options</p>
                    <p>• Inquire about the appeal process if needed</p>
                </div>';
    }
    
    $html .= '
                <div class="policy">
                    <p><strong>📋 Attendance Policy Reminder:</strong></p>
                    <p>• 3 late arrivals = 1 absent (converted automatically)</p>
                    <p>• 3 accumulated absents may result in being dropped</p>
                    <p>• Late marks that don\'t make a full absent are tracked separately</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated notification from the TrackEd System.</p>
                    <p>Please do not reply to this email.</p>
                    <p>Check your TrackEd dashboard for more details and updates.</p>
                </div>
            </div>
        </div>
    </body>
    </html>';
    
    return $html;
}
?>