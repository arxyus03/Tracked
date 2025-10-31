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

$section = $_GET['section'] ?? '';

if (empty($section)) {
    echo json_encode(["success" => false, "message" => "Section is required"]);
    exit;
}

try {
    // First, let's see what sections exist in the users table
    $allSectionsStmt = $pdo->query("SELECT DISTINCT YearandSection FROM users WHERE user_Role = 'Student'");
    $allSections = $allSectionsStmt->fetchAll(PDO::FETCH_COLUMN);
    
    error_log("All sections in users table: " . implode(', ', $allSections));
    error_log("Looking for section: " . $section);

    // Try multiple matching strategies
    $students = [];
    
    // Strategy 1: Exact match
    $exactStmt = $pdo->prepare("SELECT user_ID, user_Name, YearandSection FROM users WHERE user_Role = 'Student' AND YearandSection = ?");
    $exactStmt->execute([$section]);
    $exactStudents = $exactStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($exactStudents) > 0) {
        $students = $exactStudents;
        error_log("Found students with exact match: " . count($students));
    } else {
        // Strategy 2: Like match (contains the section)
        $likeStmt = $pdo->prepare("SELECT user_ID, user_Name, YearandSection FROM users WHERE user_Role = 'Student' AND YearandSection LIKE ?");
        $likeStmt->execute(['%' . $section . '%']);
        $likeStudents = $likeStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($likeStudents) > 0) {
            $students = $likeStudents;
            error_log("Found students with LIKE match: " . count($students));
        } else {
            // Strategy 3: Get all students (for debugging)
            $allStmt = $pdo->query("SELECT user_ID, user_Name, YearandSection FROM users WHERE user_Role = 'Student' LIMIT 10");
            $allStudents = $allStmt->fetchAll(PDO::FETCH_ASSOC);
            $students = $allStudents;
            error_log("No section match found, returning all students: " . count($students));
        }
    }

    echo json_encode([
        "success" => true,
        "students" => $students,
        "debug" => [
            "requested_section" => $section,
            "all_sections_in_db" => $allSections,
            "student_count" => count($students),
            "matching_strategy" => count($exactStudents) ? 'exact' : (count($likeStudents) ? 'like' : 'all')
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching students: " . $e->getMessage()]);
}
?>