<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$subject_code = $_GET['subject_code'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject code is required"]);
    exit;
}

try {
    $query = "SELECT * FROM classes WHERE subject_code = ?";
    $params = [$subject_code];
    
    if (!empty($professor_ID)) {
        $query .= " AND professor_ID = ?";
        $params[] = $professor_ID;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $class = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($class) {
        echo json_encode([
            "success" => true,
            "class_data" => $class
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