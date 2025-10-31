<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Use specific origin instead of *
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
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
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get raw input for debugging
$input = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log("Received data: " . print_r($input, true));

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

if (empty($input['activity_ID']) || empty($input['students'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: activity_ID or students"]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE activity_grades SET grade = ?, submitted = ?, late = ?, submitted_at = CASE WHEN ? = 1 AND submitted = 0 THEN NOW() ELSE submitted_at END WHERE activity_ID = ? AND student_ID = ?");
    
    $updatedCount = 0;
    foreach ($input['students'] as $student) {
        // Validate student data
        if (empty($student['user_ID'])) {
            error_log("Skipping student with missing user_ID: " . print_r($student, true));
            continue;
        }

        // Convert empty string to null, and remove .0 from whole numbers
        $grade = (isset($student['grade']) && $student['grade'] !== '' && $student['grade'] !== null) ? $student['grade'] : null;
        if ($grade !== null) {
            // If it's a whole number, store as integer, otherwise keep as decimal
            $grade = (float)$grade;
            if ($grade == (int)$grade) {
                $grade = (int)$grade;
            }
        }
        
        // Handle missing properties safely
        $submitted = isset($student['submitted']) ? ($student['submitted'] ? 1 : 0) : 0;
        $late = isset($student['late']) ? ($student['late'] ? 1 : 0) : 0;
        
        error_log("Updating student {$student['user_ID']}: grade=$grade, submitted=$submitted, late=$late");
        
        $result = $stmt->execute([
            $grade,
            $submitted,
            $late,
            $submitted,
            $input['activity_ID'],
            $student['user_ID']
        ]);
        
        if ($result) {
            $updatedCount++;
        } else {
            error_log("Failed to update student {$student['user_ID']}");
        }
    }

    $pdo->commit();
    error_log("Successfully updated $updatedCount students");
    echo json_encode([
        "success" => true, 
        "message" => "Grades updated successfully",
        "updated_count" => $updatedCount
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error updating grades: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error updating grades: " . $e->getMessage(),
        "error_details" => $e->getMessage()
    ]);
}
?>