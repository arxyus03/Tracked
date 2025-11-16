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

$host = 'localhost';
$dbname = 'u713320770_tracked';
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

    // Get class info - FIXED: use 'subject' instead of 'subject_name'
    $classStmt = $pdo->prepare("
        SELECT subject as subject_name, section FROM classes WHERE subject_code = ?
    ");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    // Get student info
    $studentStmt = $pdo->prepare("
        SELECT tracked_ID, CONCAT(tracked_firstname, ' ', tracked_lastname) as user_name
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
        
        // Get this student's attendance for this date
        $attendanceStmt = $pdo->prepare("
            SELECT status 
            FROM attendance 
            WHERE student_ID = ? AND subject_code = ? AND attendance_date = ?
        ");
        $attendanceStmt->execute([$student_id, $subject_code, $attendance_date]);
        $attendance_record = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
        
        $status = $attendance_record ? $attendance_record['status'] : 'absent';
        
        // Track dates for absent and late
        if ($status === 'absent') {
            $absent_dates[] = $attendance_date;
        } elseif ($status === 'late') {
            $late_dates[] = $attendance_date;
        }
        
        $formatted_date = date('F j, Y', strtotime($attendance_date));
        
        $attendance_history[] = [
            "date" => $formatted_date,
            "raw_date" => $attendance_date,
            "status" => $status
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

    // Format dates for display
    $formatted_absent_dates = array_map(function($date) {
        return date('F j, Y', strtotime($date));
    }, $absent_dates);
    
    $formatted_late_dates = array_map(function($date) {
        return date('F j, Y', strtotime($date));
    }, $late_dates);

    echo json_encode([
        "success" => true,
        "student" => [
            "id" => $student['tracked_ID'],
            "name" => $student['user_name']
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
            "total" => $total
        ],
        "attendance_dates" => [
            "absent" => $formatted_absent_dates,
            "late" => $formatted_late_dates
        ],
        "attendance_history" => $attendance_history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error fetching attendance history: " . $e->getMessage()]);
}
?>