<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

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

if (empty($input['activity_id']) || empty($input['student_id']) || empty($input['subject_code'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Check if the student is enrolled in this subject
    $enrollmentStmt = $pdo->prepare("
        SELECT 1 FROM student_classes 
        WHERE student_ID = ? AND subject_code = ? AND archived = 0
    ");
    $enrollmentStmt->execute([$input['student_id'], $input['subject_code']]);
    
    if (!$enrollmentStmt->fetch()) {
        throw new Exception("Student is not enrolled in this subject");
    }

    // Get activity deadline and points
    $activityStmt = $pdo->prepare("SELECT deadline, points FROM activities WHERE id = ?");
    $activityStmt->execute([$input['activity_id']]);
    $activity = $activityStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$activity) {
        throw new Exception("Activity not found");
    }

    // Determine if submission is late
    $now = new DateTime();
    $deadline = new DateTime($activity['deadline']);
    $isLate = $now > $deadline;

    // Check if record already exists
    $checkStmt = $pdo->prepare("
        SELECT id FROM activity_grades 
        WHERE activity_ID = ? AND student_ID = ?
    ");
    $checkStmt->execute([$input['activity_id'], $input['student_id']]);
    $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRecord) {
        // Update existing record
        $updateStmt = $pdo->prepare("
            UPDATE activity_grades 
            SET submitted = 1, 
                late = ?, 
                submitted_at = NOW(),
                updated_at = NOW()
            WHERE activity_ID = ? AND student_ID = ?
        ");
        
        $updateResult = $updateStmt->execute([
            $isLate ? 1 : 0,
            $input['activity_id'],
            $input['student_id']
        ]);

        if (!$updateResult) {
            throw new Exception("Failed to update activity grade record");
        }
    } else {
        // Insert new record
        $insertStmt = $pdo->prepare("
            INSERT INTO activity_grades 
            (activity_ID, student_ID, grade, submitted, late, submitted_at, created_at, updated_at) 
            VALUES (?, ?, 0, 1, ?, NOW(), NOW(), NOW())
        ");
        $insertResult = $insertStmt->execute([
            $input['activity_id'],
            $input['student_id'],
            $isLate ? 1 : 0
        ]);

        if (!$insertResult) {
            throw new Exception("Failed to create activity grade record");
        }
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Activity marked as " . ($isLate ? "submitted (late)" : "submitted"),
        "is_late" => $isLate
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>