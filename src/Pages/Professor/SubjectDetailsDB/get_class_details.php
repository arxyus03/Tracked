<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Localhost MySQL connection
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

$subject_code = $_GET['subject_code'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject code is required"]);
    exit;
}

try {
    // Get class details with professor name
    $stmt = $pdo->prepare("
        SELECT 
            c.subject_code,
            c.subject,
            c.section,
            c.professor_ID,
            CONCAT(p.tracked_firstname, ' ', p.tracked_lastname) as professor_name,
            p.tracked_lastname as professor_surname
        FROM classes c
        LEFT JOIN tracked_users p ON c.professor_ID = p.tracked_ID
        WHERE c.subject_code = ?
    ");
    $stmt->execute([$subject_code]);
    $class_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($class_data) {
        echo json_encode([
            "success" => true,
            "class_data" => $class_data
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Class not found"
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching class details: " . $e->getMessage()]);
}
?>