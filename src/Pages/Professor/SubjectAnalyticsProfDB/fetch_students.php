<?php
// SubjectAnalyticsProfDB/fetch_students.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get subject code from request
$subjectCode = isset($_GET['code']) ? $_GET['code'] : '';

if (empty($subjectCode)) {
    echo json_encode(['error' => 'Subject code is required']);
    exit;
}

try {
    // Fetch all students enrolled in this subject (not archived)
    $sql = "SELECT 
                tu.tracked_ID as studentId,
                CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as studentName,
                tu.tracked_ID as studentNumber,
                sc.archived
            FROM tracked_users tu
            INNER JOIN student_classes sc ON tu.tracked_ID = sc.student_ID
            WHERE sc.subject_code = :subject_code 
            AND tu.tracked_Role = 'Student'
            AND sc.archived = 0
            ORDER BY tu.tracked_lastname, tu.tracked_firstname";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':subject_code' => $subjectCode]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get class information
    $classSql = "SELECT subject, section FROM classes WHERE subject_code = :subject_code";
    $classStmt = $pdo->prepare($classSql);
    $classStmt->execute([':subject_code' => $subjectCode]);
    $classInfo = $classStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'students' => $students,
        'classInfo' => $classInfo
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Query failed: ' . $e->getMessage()]);
}
?>