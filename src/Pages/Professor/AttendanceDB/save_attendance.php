<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

if (empty($input['subject_code']) || empty($input['professor_ID']) || empty($input['attendance_date']) || empty($input['attendance_records'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // First, delete existing attendance records for this date and subject
    $deleteStmt = $pdo->prepare("DELETE FROM attendance WHERE subject_code = ? AND attendance_date = ?");
    $deleteStmt->execute([$input['subject_code'], $input['attendance_date']]);

    // Insert new attendance records
    $insertStmt = $pdo->prepare("INSERT INTO attendance (subject_code, professor_ID, attendance_date, student_ID, status) VALUES (?, ?, ?, ?, ?)");
    
    $recordsSaved = 0;
    $absentStudents = [];
    $lateStudents = [];
    
    foreach ($input['attendance_records'] as $record) {
        $insertStmt->execute([
            $input['subject_code'],
            $input['professor_ID'],
            $input['attendance_date'],
            $record['student_ID'],
            $record['status']
        ]);
        $recordsSaved++;
        
        // Track absent and late students for notifications
        if ($record['status'] === 'absent') {
            $absentStudents[] = $record['student_ID'];
        } elseif ($record['status'] === 'late') {
            $lateStudents[] = $record['student_ID'];
        }
    }

    $pdo->commit();

    // ✅ NEW: Send email notifications for absent and late students
    $emailResults = [];
    if (!empty($absentStudents) || !empty($lateStudents)) {
        require_once __DIR__ . '/../EmailNotificationDB/send_student_email.php';
        
        // Get class details
        $classStmt = $pdo->prepare("SELECT subject, section FROM classes WHERE subject_code = ?");
        $classStmt->execute([$input['subject_code']]);
        $class = $classStmt->fetch(PDO::FETCH_ASSOC);
        
        // Get student details for absent students
        if (!empty($absentStudents)) {
            $absentStudentDetails = getStudentsByIds($pdo, $absentStudents);
            foreach ($absentStudentDetails as $student) {
                $emailSubject = "Absence Notification - " . $class['subject'];
                $emailTitle = "Absence Recorded";
                $emailMessage = "You were marked as absent in " . $class['subject'] . " (" . $class['section'] . ") on " . 
                               date('M j, Y', strtotime($input['attendance_date'])) . ".\n\n" .
                               "Please coordinate with your professor if you have any concerns.";
                
                $emailSent = sendStudentEmailNotification(
                    $student['tracked_email'],
                    $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
                    $emailSubject,
                    $emailTitle,
                    $emailMessage,
                    'attendance'
                );
                
                $emailResults['absent'][] = [
                    'student_id' => $student['tracked_ID'],
                    'student_name' => $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
                    'email_sent' => $emailSent
                ];
            }
        }
        
        // Get student details for late students
        if (!empty($lateStudents)) {
            $lateStudentDetails = getStudentsByIds($pdo, $lateStudents);
            foreach ($lateStudentDetails as $student) {
                $emailSubject = "Late Arrival Notification - " . $class['subject'];
                $emailTitle = "Late Arrival Recorded";
                $emailMessage = "You were marked as late in " . $class['subject'] . " (" . $class['section'] . ") on " . 
                               date('M j, Y', strtotime($input['attendance_date'])) . ".\n\n" .
                               "Remember that three (3) late marks count as one (1) absent.";
                
                $emailSent = sendStudentEmailNotification(
                    $student['tracked_email'],
                    $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
                    $emailSubject,
                    $emailTitle,
                    $emailMessage,
                    'attendance'
                );
                
                $emailResults['late'][] = [
                    'student_id' => $student['tracked_ID'],
                    'student_name' => $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
                    'email_sent' => $emailSent
                ];
            }
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Attendance saved successfully",
        "records_saved" => $recordsSaved,
        "email_notifications" => $emailResults,
        "summary" => [
            "absent_students" => count($absentStudents),
            "late_students" => count($lateStudents),
            "present_students" => $recordsSaved - count($absentStudents) - count($lateStudents)
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error saving attendance: " . $e->getMessage()]);
}

// Helper function to get student details by IDs
function getStudentsByIds($pdo, $studentIds) {
    if (empty($studentIds)) {
        return [];
    }
    
    $placeholders = str_repeat('?,', count($studentIds) - 1) . '?';
    
    $stmt = $pdo->prepare("
        SELECT 
            tracked_ID,
            tracked_email,
            tracked_firstname,
            tracked_lastname
        FROM tracked_users 
        WHERE tracked_ID IN ($placeholders)
        AND tracked_Status = 'Active'
    ");
    
    $stmt->execute($studentIds);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>