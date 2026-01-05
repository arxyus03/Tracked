<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $student_id = $_GET['student_id'] ?? '';
    $date = $_GET['date'] ?? '';

    if (empty($student_id) || empty($date)) {
        echo json_encode(['success' => false, 'message' => 'Student ID and date are required']);
        exit;
    }
    
    // Use DATE() function to match only the date part
    $query = "
        SELECT 
            a.subject_code,
            c.subject,
            a.status,
            a.attendance_date,
            a.professor_ID
        FROM attendance a
        JOIN classes c ON a.subject_code = c.subject_code
        WHERE a.student_ID = :student_id 
        AND DATE(a.attendance_date) = :attendance_date
        ORDER BY a.subject_code
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':attendance_date', $date);
    $stmt->execute();
    
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'attendance' => $attendance,
        'count' => count($attendance)
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>