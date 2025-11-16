<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$student_id = $_GET['student_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "message" => "Student ID is required"]);
    exit;
}

try {
    // Get classes where student is enrolled AND not archived
    $stmt = $pdo->prepare("
        SELECT c.*, sc.enrolled_at 
        FROM classes c 
        INNER JOIN student_classes sc ON c.subject_code = sc.subject_code 
        WHERE sc.student_ID = ? AND sc.archived = 0 AND c.status = 'Active'
        ORDER BY sc.enrolled_at DESC
    ");
    $stmt->execute([$student_id]);
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "classes" => $classes
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching student classes: " . $e->getMessage()]);
}
?>