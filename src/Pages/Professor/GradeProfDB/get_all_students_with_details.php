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

$subject_code = $_GET['subject_code'] ?? '';
$section = $_GET['section'] ?? '';
$professor_ID = $_GET['professor_ID'] ?? '';

if (!$subject_code || !$section || !$professor_ID) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

try {
    // Get enrolled students with their details
    $sql = "
    SELECT 
        t.tracked_ID as student_id,
        t.tracked_firstname as first_name,
        t.tracked_lastname as last_name,
        t.tracked_middlename as middle_name,
        t.tracked_email as email,
        t.tracked_gender as gender,
        t.tracked_yearandsec as year_section,
        sc.enrolled_at,
        c.subject,
        c.subject_code,
        c.section
    FROM tracked_users t
    INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
    INNER JOIN classes c ON sc.subject_code = c.subject_code
    WHERE 
        t.tracked_Role = 'Student'
        AND t.tracked_Status = 'Active'
        AND sc.subject_code = ?
        AND c.section = ?
        AND c.professor_ID = ?
        AND sc.archived = 0
    ORDER BY t.tracked_lastname, t.tracked_firstname
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_code, $section, $professor_ID]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no students found with the exact section match, try without section matching
    if (empty($students)) {
        $sql = "
        SELECT 
            t.tracked_ID as student_id,
            t.tracked_firstname as first_name,
            t.tracked_lastname as last_name,
            t.tracked_middlename as middle_name,
            t.tracked_email as email,
            t.tracked_gender as gender,
            t.tracked_yearandsec as year_section,
            sc.enrolled_at,
            c.subject,
            c.subject_code,
            c.section
        FROM tracked_users t
        INNER JOIN student_classes sc ON t.tracked_ID = sc.student_ID
        INNER JOIN classes c ON sc.subject_code = c.subject_code
        WHERE 
            t.tracked_Role = 'Student'
            AND t.tracked_Status = 'Active'
            AND sc.subject_code = ?
            AND c.professor_ID = ?
            AND sc.archived = 0
        ORDER BY t.tracked_lastname, t.tracked_firstname
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$subject_code, $professor_ID]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "success" => true,
        "students" => $students,
        "count" => count($students)
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>