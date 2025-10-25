<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = '127.0.0.1';
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
        
        // Get attendance records for this date - MAKE SURE TO SELECT student_ID
        $attendanceStmt = $pdo->prepare("
            SELECT a.student_ID, a.status, u.user_Name 
            FROM attendance a 
            JOIN users u ON a.student_ID = u.user_ID 
            WHERE a.subject_code = ? AND a.professor_ID = ? AND a.attendance_date = ?
            ORDER BY u.user_Name
        ");
        $attendanceStmt->execute([$subject_code, $professor_ID, $attendance_date]);
        $attendance_records = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);

        // Format the date for display
        $formatted_date = date('F j, Y', strtotime($attendance_date));

        $attendance_history[] = [
            "date" => $formatted_date,
            "raw_date" => $attendance_date,
            "students" => $attendance_records
        ];
    }

    echo json_encode([
        "success" => true,
        "attendance_history" => $attendance_history,
        "debug" => [
            "subject_code" => $subject_code,
            "professor_ID" => $professor_ID,
            "total_dates" => count($dates),
            "sample_student_data" => count($attendance_history) > 0 ? $attendance_history[0]['students'][0] ?? 'No students' : 'No records'
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching attendance history: " . $e->getMessage()]);
}
?>