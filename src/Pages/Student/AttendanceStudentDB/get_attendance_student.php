<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
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
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$student_id = $_GET['student_id'] ?? '';

if (empty($student_id)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Student ID is required"]);
    exit;
}

try {
    // Get all classes the student is enrolled in - FIXED: use 'subject' instead of 'subject_name'
    $classesStmt = $pdo->prepare("
        SELECT c.subject_code, c.subject as subject_name, c.section
        FROM classes c 
        INNER JOIN student_classes sc ON c.subject_code = sc.subject_code 
        WHERE sc.student_ID = ? AND sc.archived = 0 AND c.status = 'Active'
    ");
    $classesStmt->execute([$student_id]);
    $classes = $classesStmt->fetchAll(PDO::FETCH_ASSOC);

    $attendance_summary = [];

    foreach ($classes as $class) {
        $subject_code = $class['subject_code'];
        
        // Count attendance status for this student in this subject
        $attendanceStmt = $pdo->prepare("
            SELECT 
                status,
                COUNT(*) as count
            FROM attendance 
            WHERE student_ID = ? AND subject_code = ?
            GROUP BY status
        ");
        $attendanceStmt->execute([$student_id, $subject_code]);
        $attendance_counts = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Initialize counts
        $present = 0;
        $late = 0;
        $absent = 0;
        
        foreach ($attendance_counts as $count) {
            switch (strtolower($count['status'])) {
                case 'present':
                    $present = (int)$count['count'];
                    break;
                case 'late':
                    $late = (int)$count['count'];
                    break;
                case 'absent':
                    $absent = (int)$count['count'];
                    break;
            }
        }
        
        // Get total classes held for this subject
        $totalStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT attendance_date) as total_classes
            FROM attendance 
            WHERE subject_code = ?
        ");
        $totalStmt->execute([$subject_code]);
        $total_result = $totalStmt->fetch(PDO::FETCH_ASSOC);
        $total_classes = $total_result ? (int)$total_result['total_classes'] : 0;
        
        // Check if student has warning (2 or more absences)
        $has_warning = $absent >= 2;

        $attendance_summary[] = [
            "subject_code" => $subject_code,
            "subject_name" => $class['subject_name'],
            "section" => $class['section'],
            "present" => $present,
            "late" => $late,
            "absent" => $absent,
            "total_classes" => $total_classes,
            "has_warning" => $has_warning
        ];
    }

    echo json_encode([
        "success" => true,
        "attendance_summary" => $attendance_summary
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error fetching attendance summary: " . $e->getMessage()]);
}
?>