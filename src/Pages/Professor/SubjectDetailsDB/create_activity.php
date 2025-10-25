<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

if (empty($input['subject_code']) || empty($input['professor_ID']) || empty($input['title'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // First, get the class section to find students
    $classStmt = $pdo->prepare("SELECT section FROM classes WHERE subject_code = ?");
    $classStmt->execute([$input['subject_code']]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    if (!$class) {
        throw new Exception("Class not found");
    }

    $section = $class['section'];

    // Insert activity
    $stmt = $pdo->prepare("INSERT INTO activities (subject_code, professor_ID, activity_type, task_number, title, instruction, link, points, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['subject_code'],
        $input['professor_ID'],
        $input['activity_type'] ?? '',
        $input['task_number'] ?? '',
        $input['title'],
        $input['instruction'] ?? '',
        $input['link'] ?? '',
        $input['points'] ?? 0,
        $input['deadline'] ?? null
    ]);

    $activity_ID = $pdo->lastInsertId();

    // Get all students in this section from users table ONLY
    $studentsStmt = $pdo->prepare("
        SELECT user_ID, user_Name
        FROM users 
        WHERE user_Role = 'Student' 
        AND YearandSection LIKE ?
    ");
    $studentsStmt->execute(['%' . $section]);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Insert grade entries for each student
    $gradeStmt = $pdo->prepare("INSERT INTO activity_grades (activity_ID, student_ID, grade, submitted, late) VALUES (?, ?, ?, ?, ?)");
    
    $studentsAdded = 0;
    foreach ($students as $student) {
        try {
            $gradeStmt->execute([
                $activity_ID,
                $student['user_ID'], // Use user_ID from users table
                null, // initial grade is null
                false, // initial submitted status is false
                false  // initial late status is false
            ]);
            $studentsAdded++;
        } catch (Exception $e) {
            error_log("Error adding student {$student['user_ID']} to activity: " . $e->getMessage());
            // Continue with other students even if one fails
            continue;
        }
    }

    $pdo->commit();

    // Prepare student data for response
    $studentsWithData = array_map(function($student) {
        return [
            'user_ID' => $student['user_ID'],
            'user_Name' => $student['user_Name'],
            'grade' => null,
            'submitted' => false,
            'late' => false
        ];
    }, $students);

    echo json_encode([
        "success" => true,
        "message" => "Activity created successfully",
        "activity_data" => [
            "id" => $activity_ID,
            "subject_code" => $input['subject_code'],
            "activity_type" => $input['activity_type'],
            "task_number" => $input['task_number'],
            "title" => $input['title'],
            "instruction" => $input['instruction'],
            "link" => $input['link'],
            "points" => $input['points'],
            "deadline" => $input['deadline'],
            "students" => $studentsWithData
        ],
        "debug" => [
            "section" => $section,
            "students_found" => count($students),
            "students_added" => $studentsAdded,
            "student_list" => $students
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error creating activity: " . $e->getMessage()]);
}
?>