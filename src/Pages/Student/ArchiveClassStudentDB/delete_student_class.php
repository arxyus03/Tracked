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

    // Check if the enrollment exists
    $checkStmt = $pdo->prepare("SELECT * FROM student_classes WHERE student_ID = ? AND subject_code = ?");
    $checkStmt->execute([$student_id, $subject_code]);
    $enrollment = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$enrollment) {
        echo json_encode([
            "success" => false,
            "message" => "Enrollment not found"
        ]);
        exit;
    }

    $pdo->beginTransaction();

    // Delete the student's activity grades for this class's activities
    $deleteGradesStmt = $pdo->prepare("
        DELETE ag FROM activity_grades ag 
        INNER JOIN activities a ON ag.activity_ID = a.id 
        WHERE ag.student_ID = ? AND a.subject_code = ?
    ");
    $deleteGradesStmt->execute([$student_id, $subject_code]);

    // Delete the student's attendance records for this class
    $deleteAttendanceStmt = $pdo->prepare("DELETE FROM attendance WHERE student_ID = ? AND subject_code = ?");
    $deleteAttendanceStmt->execute([$student_id, $subject_code]);

    // Permanently delete the student's enrollment
    $deleteEnrollmentStmt = $pdo->prepare("DELETE FROM student_classes WHERE student_ID = ? AND subject_code = ?");
    $deleteEnrollmentStmt->execute([$student_id, $subject_code]);

    $pdo->commit();

    if ($deleteEnrollmentStmt->rowCount() > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Class permanently deleted",
            "debug" => [
                'grades_deleted' => $deleteGradesStmt->rowCount(),
                'attendance_deleted' => $deleteAttendanceStmt->rowCount(),
                'enrollment_deleted' => $deleteEnrollmentStmt->rowCount()
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Class not found or already deleted"
        ]);
    }

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error deleting class: " . $e->getMessage()]);
}
?>