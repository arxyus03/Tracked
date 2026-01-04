<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Set timezone to Philippines
date_default_timezone_set('Asia/Manila');

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

$subject_code = $input['subject_code'] ?? '';
$professor_ID = $input['professor_ID'] ?? '';
$attendance_date = $input['attendance_date'] ?? '';

if (empty($subject_code) || empty($professor_ID) || empty($attendance_date)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    // Check if attendance exists for today
    $checkStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as attendance_count,
            MAX(updated_at) as last_saved_time
        FROM attendance 
        WHERE subject_code = ? 
        AND professor_ID = ? 
        AND attendance_date = ?
    ");
    $checkStmt->execute([$subject_code, $professor_ID, $attendance_date]);
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    $attendance_exists = $result['attendance_count'] > 0;
    $last_saved_time = null;
    
    if ($attendance_exists && $result['last_saved_time']) {
        // Format the last saved time - already in PH timezone
        $timeObj = new DateTime($result['last_saved_time'], new DateTimeZone('Asia/Manila'));
        $last_saved_time = $timeObj->format('g:i A');
    }
    
    // Get the attendance records if they exist
    $attendance_records = [];
    if ($attendance_exists) {
        $recordsStmt = $pdo->prepare("
            SELECT 
                student_ID,
                status
            FROM attendance 
            WHERE subject_code = ? 
            AND professor_ID = ? 
            AND attendance_date = ?
        ");
        $recordsStmt->execute([$subject_code, $professor_ID, $attendance_date]);
        $attendance_records = $recordsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        "success" => true,
        "attendance_exists" => $attendance_exists,
        "last_saved_time" => $last_saved_time,
        "attendance_records" => $attendance_records,
        "summary" => [
            "total_records" => count($attendance_records),
            "subject_code" => $subject_code,
            "attendance_date" => $attendance_date,
            "timezone" => "Asia/Manila (UTC+8)",
            "current_server_time" => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error checking attendance: " . $e->getMessage()]);
}
?>