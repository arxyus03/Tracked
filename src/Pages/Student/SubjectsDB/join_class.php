<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if (empty($input['student_id']) || empty($input['subject_code'])) {
    echo json_encode(["success" => false, "message" => "Student ID and Subject Code are required"]);
    exit;
}

try {
    $student_id = $input['student_id'];
    $subject_code = $input['subject_code'];

    // Check if class exists and is active
    $classStmt = $pdo->prepare("SELECT * FROM classes WHERE subject_code = ? AND status = 'Active'");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    if (!$class) {
        echo json_encode(["success" => false, "message" => "Class not found or not active"]);
        exit;
    }

    // Check if student exists in tracked_users table
    $studentStmt = $pdo->prepare("SELECT * FROM tracked_users WHERE tracked_ID = ? AND tracked_Role = 'Student' AND tracked_Status = 'Active'");
    $studentStmt->execute([$student_id]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(["success" => false, "message" => "Student not found"]);
        exit;
    }

    // Check if student is already enrolled in this class (only active enrollments)
    $enrollmentStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ? AND archived = 0");
    $enrollmentStmt->execute([$student_id, $subject_code]);
    $existingEnrollment = $enrollmentStmt->fetch(PDO::FETCH_ASSOC);

    if ($existingEnrollment) {
        echo json_encode(["success" => false, "message" => "Student is already enrolled in this class"]);
        exit;
    }

    // Check if there's an archived enrollment that we can restore
    $archivedEnrollmentStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ? AND archived = 1");
    $archivedEnrollmentStmt->execute([$student_id, $subject_code]);
    $archivedEnrollment = $archivedEnrollmentStmt->fetch(PDO::FETCH_ASSOC);

    if ($archivedEnrollment) {
        // Restore the archived enrollment
        $restoreStmt = $pdo->prepare("UPDATE student_classes SET archived = 0, archived_at = NULL WHERE student_ID = ? AND subject_code = ?");
        $restoreStmt->execute([$student_id, $subject_code]);
        
        echo json_encode([
            "success" => true,
            "message" => "Successfully re-enrolled in class",
            "class_data" => $class,
            "restored" => true
        ]);
    } else {
        // Create new enrollment
        $enrollStmt = $pdo->prepare("INSERT INTO student_classes (student_ID, subject_code, enrolled_at) VALUES (?, ?, NOW())");
        $enrollStmt->execute([$student_id, $subject_code]);

        echo json_encode([
            "success" => true,
            "message" => "Successfully enrolled in class",
            "class_data" => $class,
            "restored" => false
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error joining class: " . $e->getMessage()]);
}
?>