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
$attendance_records = $input['attendance_records'] ?? [];

if (empty($subject_code) || empty($professor_ID) || empty($attendance_date) || empty($attendance_records)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Get current timestamp in Asia/Manila timezone
    $current_time = new DateTime('now', new DateTimeZone('Asia/Manila'));
    $updated_at = $current_time->format('Y-m-d H:i:s');
    
    foreach ($attendance_records as $record) {
        $student_ID = $record['student_ID'] ?? '';
        $status = $record['status'] ?? '';
        
        if (empty($student_ID) || empty($status)) {
            continue;
        }
        
        // Check if record exists
        $checkStmt = $pdo->prepare("
            SELECT id, created_at FROM attendance 
            WHERE subject_code = ? AND professor_ID = ? AND student_ID = ? AND attendance_date = ?
        ");
        $checkStmt->execute([$subject_code, $professor_ID, $student_ID, $attendance_date]);
        $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingRecord) {
            // Update existing record - keep original created_at, update updated_at
            $updateStmt = $pdo->prepare("
                UPDATE attendance 
                SET status = ?, updated_at = ?
                WHERE subject_code = ? AND professor_ID = ? AND student_ID = ? AND attendance_date = ?
            ");
            $updateStmt->execute([$status, $updated_at, $subject_code, $professor_ID, $student_ID, $attendance_date]);
        } else {
            // Insert new record - use current time for both created_at and updated_at
            $insertStmt = $pdo->prepare("
                INSERT INTO attendance (subject_code, professor_ID, student_ID, attendance_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $insertStmt->execute([$subject_code, $professor_ID, $student_ID, $attendance_date, $status, $updated_at, $updated_at]);
        }
    }
    
    $pdo->commit();
    
    // Format date and time for response
    $display_date = (new DateTime($attendance_date))->format('F j, Y');
    $display_time = $current_time->format('g:i A');
    
    echo json_encode([
        "success" => true, 
        "message" => "Attendance updated successfully",
        "updated_at" => $updated_at,
        "display_date" => $display_date,
        "display_time" => $display_time,
        "timezone_info" => [
            "timezone" => "Asia/Manila",
            "utc_offset" => "+08:00"
        ]
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error updating attendance: " . $e->getMessage()]);
}
?>