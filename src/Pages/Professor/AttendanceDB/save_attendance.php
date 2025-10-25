<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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

    // Check if attendance already exists for this date and subject
    $checkStmt = $pdo->prepare("SELECT id FROM attendance WHERE subject_code = ? AND attendance_date = ? LIMIT 1");
    $checkStmt->execute([$input['subject_code'], $input['attendance_date']]);
    $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRecord) {
        // Update existing attendance records
        $updateStmt = $pdo->prepare("UPDATE attendance SET status = ? WHERE subject_code = ? AND attendance_date = ? AND student_ID = ?");
        
        foreach ($input['attendance_records'] as $record) {
            $updateStmt->execute([
                $record['status'],
                $input['subject_code'],
                $input['attendance_date'],
                $record['student_ID']
            ]);
        }
    } else {
        // Insert new attendance records
        $insertStmt = $pdo->prepare("INSERT INTO attendance (subject_code, professor_ID, attendance_date, student_ID, status) VALUES (?, ?, ?, ?, ?)");
        
        foreach ($input['attendance_records'] as $record) {
            $insertStmt->execute([
                $input['subject_code'],
                $input['professor_ID'],
                $input['attendance_date'],
                $record['student_ID'],
                $record['status']
            ]);
        }
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Attendance saved successfully",
        "debug" => [
            "subject_code" => $input['subject_code'],
            "attendance_date" => $input['attendance_date'],
            "records_saved" => count($input['attendance_records'])
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error saving attendance: " . $e->getMessage()]);
}
?>