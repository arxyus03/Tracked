<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$subject_code = $_GET['subject_code'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (empty($subject_code) || empty($professor_ID)) {
    echo json_encode(["success" => false, "message" => "Subject code and professor ID are required"]);
    exit;
}

try {
    // Get all students enrolled in this class from tracked_users
    $enrolledStmt = $pdo->prepare("
        SELECT t.tracked_ID as user_ID, CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        WHERE sc.subject_code = ? AND sc.archived = 0
        AND t.tracked_Role = 'Student' AND t.tracked_Status = 'Active'
        ORDER BY t.tracked_fname, t.tracked_lname
    ");
    $enrolledStmt->execute([$subject_code]);
    $allEnrolledStudents = $enrolledStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create a map of all enrolled students for quick lookup
    $enrolledStudentsMap = [];
    foreach ($allEnrolledStudents as $student) {
        $enrolledStudentsMap[$student['user_ID']] = $student;
    }

    // Get distinct attendance dates for this subject
    $datesStmt = $pdo->prepare("
        SELECT DISTINCT attendance_date 
        FROM attendance 
        WHERE subject_code = ? AND professor_ID = ? 
        ORDER BY attendance_date DESC
    ");
    $datesStmt->execute([$subject_code, $professor_ID]);
    $dates = $datesStmt->fetchAll(PDO::FETCH_ASSOC);

    $attendance_history = [];

    foreach ($dates as $date_record) {
        $attendance_date = $date_record['attendance_date'];
        
        // Get attendance records for this date using tracked_users
        $attendanceStmt = $pdo->prepare("
            SELECT a.student_ID, a.status, CONCAT(t.tracked_fname, ' ', t.tracked_lname) as user_Name 
            FROM attendance a 
            JOIN tracked_users t ON a.student_ID = t.tracked_ID 
            WHERE a.subject_code = ? AND a.professor_ID = ? AND a.attendance_date = ?
        ");
        $attendanceStmt->execute([$subject_code, $professor_ID, $attendance_date]);
        $attendance_records = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Create a map of attendance records for this date
        $attendanceMap = [];
        foreach ($attendance_records as $record) {
            $attendanceMap[$record['student_ID']] = $record;
        }
        
        // Build complete student list for this date
        // Include ALL enrolled students, with their attendance status if available
        $completeStudentList = [];
        foreach ($allEnrolledStudents as $enrolledStudent) {
            $studentId = $enrolledStudent['user_ID'];
            
            if (isset($attendanceMap[$studentId])) {
                // Student has attendance record for this date
                $completeStudentList[] = $attendanceMap[$studentId];
            } else {
                // Student was enrolled but no attendance record exists (marked as absent by default)
                $completeStudentList[] = [
                    'student_ID' => $studentId,
                    'user_Name' => $enrolledStudent['user_Name'],
                    'status' => 'absent' // Default status for missing records
                ];
            }
        }
        
        // Sort by student name
        usort($completeStudentList, function($a, $b) {
            return strcmp($a['user_Name'], $b['user_Name']);
        });

        // Format the date for display
        $formatted_date = date('F j, Y', strtotime($attendance_date));

        $attendance_history[] = [
            "date" => $formatted_date,
            "raw_date" => $attendance_date,
            "students" => $completeStudentList
        ];
    }

    echo json_encode([
        "success" => true,
        "attendance_history" => $attendance_history,
        "debug" => [
            "subject_code" => $subject_code,
            "professor_ID" => $professor_ID,
            "total_enrolled_students" => count($allEnrolledStudents),
            "total_attendance_dates" => count($dates),
            "enrolled_students" => $allEnrolledStudents
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching attendance history: " . $e->getMessage()]);
}
?>