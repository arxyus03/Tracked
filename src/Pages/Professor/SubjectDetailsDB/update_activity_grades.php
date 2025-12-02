<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Localhost MySQL connection
$host = 'localhost';
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

    // Updated SQL to handle submitted_at properly
    $stmt = $pdo->prepare("
        UPDATE activity_grades 
        SET grade = ?, 
            submitted = ?, 
            late = ?, 
            submitted_at = CASE 
                WHEN ? = 1 AND submitted_at IS NULL THEN NOW()  -- Set timestamp when first submitting
                WHEN ? = 0 THEN NULL  -- Clear timestamp when marking as not submitted (missed)
                ELSE submitted_at  -- Keep existing timestamp if already set
            END,
            updated_at = NOW() 
        WHERE activity_ID = ? 
        AND student_ID = ?
    ");
    
    $updatedCount = 0;
    $errors = [];
    
    foreach ($input['students'] as $student) {
        // Validate student data
        if (empty($student['user_ID'])) {
            $errors[] = "Skipping student with missing user_ID: " . print_r($student, true);
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
        
        // Handle missing properties safely with proper default values
        $submitted = isset($student['submitted']) ? ($student['submitted'] ? 1 : 0) : 0;
        $late = isset($student['late']) ? ($student['late'] ? 1 : 0) : 0;
        
        error_log("Updating student {$student['user_ID']}: grade=$grade, submitted=$submitted, late=$late");
        
        try {
            $result = $stmt->execute([
                $grade,
                $submitted,
                $late,
                $submitted, // First parameter for CASE WHEN condition
                $submitted, // Second parameter for CASE WHEN condition  
                $input['activity_ID'],
                $student['user_ID']
            ]);
            
            if ($result) {
                $updatedCount++;
                error_log("Successfully updated student {$student['user_ID']}");
            } else {
                $errorInfo = $stmt->errorInfo();
                $errors[] = "Failed to update student {$student['user_ID']}: " . ($errorInfo[2] ?? 'Unknown error');
                error_log("Failed to update student {$student['user_ID']}: " . print_r($errorInfo, true));
            }
        } catch (Exception $e) {
            $errors[] = "Error updating student {$student['user_ID']}: " . $e->getMessage();
            error_log("Exception updating student {$student['user_ID']}: " . $e->getMessage());
        }
    }

    $pdo->commit();
    
    error_log("Successfully updated $updatedCount students");
    
    $response = [
        "success" => true, 
        "message" => "Grades updated successfully",
        "updated_count" => $updatedCount,
        "total_students" => count($input['students'])
    ];
    
    if (!empty($errors)) {
        $response['errors'] = $errors;
        $response['warning'] = "Some students could not be updated";
    }
    
    echo json_encode($response);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error updating grades: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Error updating grades: " . $e->getMessage(),
        "error_details" => $e->getMessage(),
        "stack_trace" => $e->getTraceAsString()
    ]);
}
?>