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
    foreach ($input['attendance_records'] as $record) {
        $insertStmt->execute([
            $input['subject_code'],
            $input['professor_ID'],
            $input['attendance_date'],
            $record['student_ID'],
            $record['status']
        ]);
        $recordsSaved++;
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Attendance saved successfully",
        "records_saved" => $recordsSaved
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error saving attendance: " . $e->getMessage()]);
}
?>