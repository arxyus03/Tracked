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

if (empty($subject_code) || empty($professor_ID)) {
    echo json_encode(["success" => false, "message" => "Subject code and professor ID are required"]);
    exit;
}

try {
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
            SELECT a.student_ID, a.status, 
                   CONCAT(t.tracked_firstname, ' ', t.tracked_lastname) as user_Name,
                   t.tracked_yearandsec
            FROM attendance a 
            JOIN tracked_users t ON a.student_ID = t.tracked_ID 
            WHERE a.subject_code = ? AND a.professor_ID = ? AND a.attendance_date = ?
            ORDER BY t.tracked_firstname, t.tracked_lastname
        ");
        $attendanceStmt->execute([$subject_code, $professor_ID, $attendance_date]);
        $attendance_records = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Only include students who actually have attendance records for this date
        // This ensures we don't mark students as "absent" for dates before they enrolled
        $completeStudentList = [];
        foreach ($attendance_records as $record) {
            $completeStudentList[] = $record;
        }

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
        "attendance_history" => $attendance_history
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching attendance history: " . $e->getMessage()]);
}
?>