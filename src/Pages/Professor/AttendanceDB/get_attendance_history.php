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
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$subject_code = $_GET['subject_code'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject code is required"]);
    exit;
}

try {
    // Debug: Log the incoming parameters
    error_log("Fetching attendance for subject: $subject_code, professor: $professor_ID");
    
    // First, check if there are any attendance records for this subject
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM attendance 
        WHERE subject_code = ? 
        AND (? = '' OR professor_ID = ?)
    ");
    $checkStmt->execute([$subject_code, $professor_ID, $professor_ID]);
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] == 0) {
        error_log("No attendance records found for subject: $subject_code");
        echo json_encode([
            "success" => true,
            "attendance_history" => [],
            "message" => "No attendance records found"
        ]);
        exit;
    }
    
    // Get distinct attendance dates for this subject
    $datesStmt = $pdo->prepare("
        SELECT DISTINCT attendance_date 
        FROM attendance 
        WHERE subject_code = ? 
        AND (? = '' OR professor_ID = ?)
        ORDER BY attendance_date DESC
    ");
    $datesStmt->execute([$subject_code, $professor_ID, $professor_ID]);
    $dates = $datesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Found " . count($dates) . " attendance dates for subject: $subject_code");
    
    // Get all students enrolled in this subject
    $studentsStmt = $pdo->prepare("
        SELECT DISTINCT 
            a.student_ID,
            CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name
        FROM attendance a
        JOIN tracked_users t ON a.student_ID = t.tracked_ID
        WHERE a.subject_code = ?
        AND (? = '' OR a.professor_ID = ?)
        ORDER BY user_Name
    ");
    $studentsStmt->execute([$subject_code, $professor_ID, $professor_ID]);
    $allStudents = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $attendance_history = [];

    foreach ($dates as $date_record) {
        $attendance_date = $date_record['attendance_date'];
        
        // Get attendance records for this specific date
        $attendanceStmt = $pdo->prepare("
            SELECT 
                a.student_ID, 
                a.status,
                CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name
            FROM attendance a
            JOIN tracked_users t ON a.student_ID = t.tracked_ID
            WHERE a.subject_code = ?
            AND a.attendance_date = ?
            AND (? = '' OR a.professor_ID = ?)
            ORDER BY user_Name
        ");
        $attendanceStmt->execute([$subject_code, $attendance_date, $professor_ID, $professor_ID]);
        $attendance_records = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the date for display
        $formatted_date = date('F j, Y', strtotime($attendance_date));
        
        // Prepare the student list for this date
        $studentsForDate = [];
        
        // Add all students with their attendance status
        foreach ($allStudents as $student) {
            $studentId = $student['student_ID'];
            $status = 'absent'; // Default status
            
            // Find if this student has attendance record for this date
            foreach ($attendance_records as $record) {
                if ($record['student_ID'] == $studentId) {
                    $status = $record['status'];
                    break;
                }
            }
            
            $studentsForDate[] = [
                'student_ID' => $studentId,
                'user_Name' => $student['user_Name'],
                'status' => $status
            ];
        }
        
        $attendance_history[] = [
            "date" => $formatted_date,
            "raw_date" => $attendance_date,
            "students" => $studentsForDate
        ];
    }
    
    error_log("Returning " . count($attendance_history) . " attendance records");

    echo json_encode([
        "success" => true,
        "attendance_history" => $attendance_history,
        "total_records" => count($attendance_history),
        "subject_code" => $subject_code,
        "professor_ID" => $professor_ID
    ]);

} catch (Exception $e) {
    error_log("Error in get_attendance_history.php: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Error fetching attendance history: " . $e->getMessage(),
        "error_details" => $e->getMessage()
    ]);
}
?>