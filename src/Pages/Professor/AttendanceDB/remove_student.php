<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
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

// Get JSON input data
$input = json_decode(file_get_contents("php://input"), true);
$student_ID = $input['student_ID'] ?? '';
$subject_code = $input['subject_code'] ?? '';
$professor_ID = $input['professor_ID'] ?? '';

if (empty($student_ID) || empty($subject_code) || empty($professor_ID)) {
    echo json_encode(["success" => false, "message" => "Student ID, subject code and professor ID are required"]);
    exit;
}

try {
    // Verify professor owns this class
    $classStmt = $pdo->prepare("
        SELECT * FROM classes 
        WHERE subject_code = ? AND professor_ID = ?
    ");
    $classStmt->execute([$subject_code, $professor_ID]);
    
    if ($classStmt->rowCount() == 0) {
        echo json_encode(["success" => false, "message" => "Unauthorized access to this class"]);
        exit;
    }

    // Verify student is enrolled in this class
    $enrollmentStmt = $pdo->prepare("
        SELECT * FROM student_classes 
        WHERE student_ID = ? AND subject_code = ? AND archived = 0
    ");
    $enrollmentStmt->execute([$student_ID, $subject_code]);
    
    if ($enrollmentStmt->rowCount() == 0) {
        echo json_encode(["success" => false, "message" => "Student is not enrolled in this class"]);
        exit;
    }

    // Get student name for response from tracked_users
    $studentStmt = $pdo->prepare("
        SELECT CONCAT(tracked_firstname, ' ', tracked_lastname) as user_Name
        FROM tracked_users 
        WHERE tracked_ID = ? AND tracked_Role = 'Student'
    ");
    $studentStmt->execute([$student_ID]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);
    $student_name = $student['user_Name'] ?? $student_ID;

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Remove student from student_classes table (set as archived)
        $removeEnrollmentStmt = $pdo->prepare("
            DELETE FROM student_classes 
            WHERE student_ID = ? AND subject_code = ?
        ");
        $removeEnrollmentStmt->execute([$student_ID, $subject_code]);

        // Remove student's attendance records for this class
        $removeAttendanceStmt = $pdo->prepare("
            DELETE FROM attendance 
            WHERE student_ID = ? AND subject_code = ?
        ");
        $removeAttendanceStmt->execute([$student_ID, $subject_code]);

        // Remove student's activity grades for this class
        $removeGradesStmt = $pdo->prepare("
            DELETE ag FROM activity_grades ag 
            INNER JOIN activities a ON ag.activity_ID = a.id 
            WHERE ag.student_ID = ? AND a.subject_code = ?
        ");
        $removeGradesStmt->execute([$student_ID, $subject_code]);

        // Commit transaction
        $pdo->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Student removed successfully",
            "debug" => [
                "student_ID" => $student_ID,
                "student_name" => $student_name,
                "subject_code" => $subject_code,
                "professor_ID" => $professor_ID,
                "enrollment_removed" => $removeEnrollmentStmt->rowCount(),
                "attendance_records_removed" => $removeAttendanceStmt->rowCount(),
                "activity_grades_removed" => $removeGradesStmt->rowCount()
            ]
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error removing student: " . $e->getMessage()]);
}
?>