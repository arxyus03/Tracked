<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection configuration
$host = 'localhost';
$dbname = 'tracked';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$response = ['success' => false, 'message' => '', 'class_data' => null, 'debug' => []];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Expected POST, got ' . $_SERVER['REQUEST_METHOD']);
    }

    // Get JSON input
    $raw_input = file_get_contents('php://input');
    $response['debug']['raw_input'] = $raw_input;
    
    $input = json_decode($raw_input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }
    
    if (!$input) {
        throw new Exception('Empty or invalid JSON input');
    }

    $response['debug']['received_data'] = $input;

    // Validate required fields
    $required_fields = ['year_level', 'subject', 'section', 'professor_ID'];
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        throw new Exception("Missing required fields: " . implode(', ', $missing_fields));
    }

    $year_level = trim($input['year_level']);
    $subject = trim($input['subject']);
    $section = trim($input['section']);
    $professor_ID = trim($input['professor_ID']);

    // Check if professor exists in tracked_users table
    $check_professor_sql = "SELECT COUNT(*) FROM tracked_users WHERE tracked_ID = ?";
    $stmt = $pdo->prepare($check_professor_sql);
    $stmt->execute([$professor_ID]);
    $professor_exists = $stmt->fetchColumn();
    
    $response['debug']['professor_check'] = [
        'professor_ID' => $professor_ID,
        'exists' => $professor_exists
    ];

    if (!$professor_exists) {
        throw new Exception("Professor with ID '$professor_ID' does not exist in tracked_users table");
    }

    // Generate unique subject code
    $subject_code = generateUniqueSubjectCode($pdo);
    $response['debug']['generated_code'] = $subject_code;

    // Insert class into database
    $sql = "INSERT INTO classes (subject_code, year_level, subject, section, professor_ID) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$subject_code, $year_level, $subject, $section, $professor_ID]);
    
    $response['debug']['insert_result'] = $result;
    $response['debug']['row_count'] = $stmt->rowCount();

    if (!$result) {
        throw new Exception('Failed to insert class into database');
    }

    // Get the created class data
    $sql = "SELECT * FROM classes WHERE subject_code = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$subject_code]);
    $class_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$class_data) {
        throw new Exception('Failed to retrieve created class data');
    }

    $response['success'] = true;
    $response['message'] = 'Class created successfully';
    $response['class_data'] = $class_data;

} catch (PDOException $e) {
    $response['debug']['pdo_error'] = [
        'code' => $e->getCode(),
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ];
    
    if ($e->getCode() == '23000') {
        $response['message'] = 'Database constraint error: ' . $e->getMessage();
    } else {
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} catch (Exception $e) {
    $response['debug']['exception'] = [
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ];
    $response['message'] = $e->getMessage();
}

// For debugging, you can check the response in browser console
error_log("Create Class Response: " . json_encode($response));

echo json_encode($response);

/**
 * Generate a unique subject code (6 characters: 2 letters + 4 numbers)
 */
function generateUniqueSubjectCode($pdo) {
    $max_attempts = 10;
    $attempts = 0;
    
    while ($attempts < $max_attempts) {
        // Generate 2 random uppercase letters
        $letters = '';
        for ($i = 0; $i < 2; $i++) {
            $letters .= chr(rand(65, 90)); // A-Z
        }
        
        // Generate 4 random numbers
        $numbers = sprintf("%04d", rand(0, 9999));
        
        $subject_code = $letters . $numbers;
        
        // Check if code already exists
        $sql = "SELECT COUNT(*) FROM classes WHERE subject_code = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$subject_code]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            return $subject_code;
        }
        
        $attempts++;
    }
    
    throw new Exception('Could not generate unique subject code after multiple attempts');
}
?>