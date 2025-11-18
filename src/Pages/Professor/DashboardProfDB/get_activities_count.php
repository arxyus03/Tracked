<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if (!isset($_GET['professor_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Professor ID is required'
        ]);
        exit;
    }
    
    $professorId = $_GET['professor_id'];
    
    // Count activities that need attention (pending submissions OR submitted but not graded)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT a.id) as activities_to_grade
        FROM activities a
        WHERE a.professor_ID = :professor_id 
        AND a.archived = 0
        AND (
            -- Activities with pending submissions (not submitted yet)
            EXISTS (
                SELECT 1 
                FROM activity_grades ag 
                WHERE ag.activity_ID = a.id 
                AND ag.submitted = 0
            )
            OR
            -- OR activities with submitted work but no grade assigned
            EXISTS (
                SELECT 1 
                FROM activity_grades ag 
                WHERE ag.activity_ID = a.id 
                AND ag.submitted = 1 
                AND (ag.grade IS NULL OR ag.grade = '')
            )
        )
    ");
    
    $stmt->bindParam(':professor_id', $professorId);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'total_activities' => (int)$result['activities_to_grade'],
        'message' => 'Activities needing grading attention'
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'total_activities' => 0
    ]);
}

$conn = null;
?>