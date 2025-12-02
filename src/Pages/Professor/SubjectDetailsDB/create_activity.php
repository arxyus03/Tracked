<?php
// Add extensive error reporting at the very top
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Headers must come before any output
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Set timezone to UTC
date_default_timezone_set('UTC');

// Localhost MySQL connection
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
    exit;
}

if (empty($input['subject_code']) || empty($input['professor_ID']) || empty($input['title'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Function to ensure student exists in users table
function ensureStudentExistsInUsersTable($pdo, $student) {
    try {
        // Check if student exists in users table
        $checkStmt = $pdo->prepare("SELECT user_ID FROM users WHERE user_ID = ?");
        $checkStmt->execute([$student['tracked_ID']]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existing) {
            // Get additional student details from tracked_users
            $detailsStmt = $pdo->prepare("
                SELECT tracked_middlename, tracked_program, tracked_yearandsec, tracked_semester, tracked_bday, tracked_gender, tracked_phone 
                FROM tracked_users 
                WHERE tracked_ID = ?
            ");
            $detailsStmt->execute([$student['tracked_ID']]);
            $studentDetails = $detailsStmt->fetch(PDO::FETCH_ASSOC);
            
            // Insert into users table if doesn't exist
            $insertStmt = $pdo->prepare("
                INSERT INTO users (user_ID, user_firstname, user_middlename, user_lastname, user_Email, user_phonenumber, user_bday, user_Gender, user_Role, user_yearandsection, user_program, user_semester) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $insertStmt->execute([
                $student['tracked_ID'],
                $student['tracked_firstname'],
                $studentDetails['tracked_middlename'] ?? '',
                $student['tracked_lastname'], 
                $student['tracked_email'],
                $studentDetails['tracked_phone'] ?? 0,
                $studentDetails['tracked_bday'] ?? '2000-01-01',
                $studentDetails['tracked_gender'] ?? '',
                'Student',
                $studentDetails['tracked_yearandsec'] ?? '',
                $studentDetails['tracked_program'] ?? '',  
                $studentDetails['tracked_semester'] ?? ''
            ]);
            
            error_log("Added student {$student['tracked_ID']} to users table");
        }
        return true;
    } catch (Exception $e) {
        error_log("Error ensuring student in users table: " . $e->getMessage());
        throw $e;
    }
}

// Function to get students by their IDs
function getStudentsByIds($pdo, $studentIds, $subject_code) {
    if (empty($studentIds)) {
        return [];
    }
    
    $placeholders = str_repeat('?,', count($studentIds) - 1) . '?';
    
    $stmt = $pdo->prepare("
        SELECT 
            tu.tracked_ID,
            tu.tracked_email,
            tu.tracked_firstname,
            tu.tracked_lastname,
            CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as user_Name
        FROM tracked_users tu
        INNER JOIN student_classes sc ON tu.tracked_ID = sc.student_ID
        WHERE sc.subject_code = ? AND sc.archived = 0
        AND tu.tracked_ID IN ($placeholders)
        AND tu.tracked_Role = 'Student' AND tu.tracked_Status = 'Active'
    ");
    
    $params = array_merge([$subject_code], $studentIds);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

try {
    $pdo->beginTransaction();

    // First, get the class section to find students
    $classStmt = $pdo->prepare("SELECT subject, section FROM classes WHERE subject_code = ?");
    $classStmt->execute([$input['subject_code']]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);

    if (!$class) {
        throw new Exception("Class not found");
    }

    // Format deadline for database storage (convert from datetime-local to MySQL datetime)
    $deadline = null;
    if (!empty($input['deadline'])) {
        $deadline = date('Y-m-d H:i:s', strtotime($input['deadline']));
    }

    // Get current timestamp for created_at in UTC
    $currentTimestamp = date('Y-m-d H:i:s');

    // Insert activity with explicit created_at timestamp
    $stmt = $pdo->prepare("INSERT INTO activities (subject_code, professor_ID, activity_type, task_number, title, instruction, link, points, deadline, archived, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)");
    $stmt->execute([
        $input['subject_code'],
        $input['professor_ID'],
        $input['activity_type'] ?? '',
        $input['task_number'] ?? '',
        $input['title'],
        $input['instruction'] ?? '',
        $input['link'] ?? '',
        $input['points'] ?? 0,
        $deadline,
        $currentTimestamp
    ]);

    $activity_ID = $pdo->lastInsertId();

    // Determine which students to assign based on "assignTo" option
    $students = [];
    $assignTo = $input['assignTo'] ?? 'wholeClass'; // Default to whole class
    $selectedStudentIds = $input['selectedStudents'] ?? [];

    if ($assignTo === 'wholeClass') {
        // Get all students in the class
        $studentsStmt = $pdo->prepare("
            SELECT 
                tu.tracked_ID,
                tu.tracked_email,
                tu.tracked_firstname,
                tu.tracked_lastname,
                CONCAT(tu.tracked_firstname, ' ', tu.tracked_lastname) as user_Name
            FROM tracked_users tu
            INNER JOIN student_classes sc ON tu.tracked_ID = sc.student_ID
            WHERE sc.subject_code = ? AND sc.archived = 0
            AND tu.tracked_Role = 'Student' AND tu.tracked_Status = 'Active'
        ");
        $studentsStmt->execute([$input['subject_code']]);
        $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
        
    } elseif ($assignTo === 'individual' && !empty($selectedStudentIds)) {
        // Get only the selected students
        $students = getStudentsByIds($pdo, $selectedStudentIds, $input['subject_code']);
    }

    // Insert grade entries for each student
    $gradeStmt = $pdo->prepare("INSERT INTO activity_grades (activity_ID, student_ID, grade, submitted, late) VALUES (?, ?, ?, ?, ?)");
    
    $studentsAdded = 0;
    $gradeErrors = [];
    
    foreach ($students as $student) {
        try {
            // Ensure student exists in users table (for foreign key constraint)
            ensureStudentExistsInUsersTable($pdo, $student);
            
            $gradeStmt->execute([
                $activity_ID,
                $student['tracked_ID'],
                null,
                0, // Use 0 instead of false for MySQL
                0  // Use 0 instead of false for MySQL
            ]);
            $studentsAdded++;
        } catch (Exception $e) {
            $gradeErrors[] = "Student {$student['tracked_ID']}: " . $e->getMessage();
            error_log("Error adding student {$student['tracked_ID']} to activity: " . $e->getMessage());
            continue;
        }
    }

    $pdo->commit();

    // ✅ NEW: Send email notifications to assigned students about new activity
    if (count($students) > 0) {
        require_once __DIR__ . '/../EmailNotificationDB/send_student_email.php';
        
        $assignmentType = $assignTo === 'individual' ? ' (Assigned to You)' : '';
        $emailSubject = "New " . ($input['activity_type'] ?? 'Activity') . ": " . $input['title'] . $assignmentType;
        $emailTitle = "New " . ($input['activity_type'] ?? 'Activity') . " in " . $class['subject'] . " (" . $class['section'] . ")" . $assignmentType;
        
        $emailMessage = "A new " . ($input['activity_type'] ?? 'activity') . " has been " . 
                       ($assignTo === 'individual' ? "assigned to you:\n\n" : "posted:\n\n") .
                       "Title: " . $input['title'] . "\n" .
                       ($input['instruction'] ? "Instructions: " . $input['instruction'] . "\n" : "") .
                       ($input['points'] ? "Points: " . $input['points'] . "\n" : "") .
                       ($deadline ? "Deadline: " . date('M j, Y g:i A', strtotime($deadline)) : "");
        
        $emailResults = sendBatchStudentEmails($students, $emailSubject, $emailTitle, $emailMessage, 'deadline');
    } else {
        $emailResults = ['success' => 0, 'failed' => 0, 'details' => []];
        
        // If individual assignment but no students selected, show warning
        if ($assignTo === 'individual' && empty($selectedStudentIds)) {
            $response['warning'] = "No students were selected for individual assignment";
        }
    }

    // Prepare student data for response
    $studentsWithData = array_map(function($student) {
        return [
            'user_ID' => $student['tracked_ID'],
            'user_Name' => $student['user_Name'],
            'grade' => null,
            'submitted' => false,
            'late' => false
        ];
    }, $students);

    $response = [
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
            "archived" => 0,
            "created_at" => $currentTimestamp,
            "students" => $studentsWithData,
            "assign_to" => $assignTo,
            "assigned_students_count" => count($students)
        ],
        "email_notifications" => $emailResults,
        "students_added" => $studentsAdded,
        "total_students" => count($students)
    ];

    // Add grade errors to response if any
    if (!empty($gradeErrors)) {
        $response['grade_errors'] = $gradeErrors;
        $response['warning'] = "Some students could not be added to the activity";
    }

    echo json_encode($response);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Activity creation error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Error creating activity: " . $e->getMessage(),
        "debug_info" => [
            "subject_code" => $input['subject_code'] ?? 'none',
            "professor_ID" => $input['professor_ID'] ?? 'none', 
            "title" => $input['title'] ?? 'none',
            "activity_type" => $input['activity_type'] ?? 'none',
            "task_number" => $input['task_number'] ?? 'none',
            "assign_to" => $input['assignTo'] ?? 'none',
            "selected_students_count" => isset($input['selectedStudents']) ? count($input['selectedStudents']) : 0
        ]
    ]);
}
?>