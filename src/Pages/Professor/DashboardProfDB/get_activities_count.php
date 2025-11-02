<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'tracked';
$username = 'root'; // Change if different
$password = ''; // Change if you have a password

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get professor ID from query parameter
    if (!isset($_GET['professor_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Professor ID is required'
        ]);
        exit;
    }
    
    $professorId = $_GET['professor_id'];
    
    // Count activities that have at least one student NOT submitted (need grading)
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT a.id) as activities_to_grade
        FROM activities a
        INNER JOIN activity_grades ag ON a.id = ag.activity_ID
        WHERE a.professor_ID = :professor_id 
        AND a.archived = 0
        AND ag.submitted = 0  -- At least one student hasn't submitted
    ");
    
    $stmt->bindParam(':professor_id', $professorId);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'total_activities' => (int)$result['activities_to_grade'],
        'message' => 'Activities with pending submissions'
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