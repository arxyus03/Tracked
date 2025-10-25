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

$subject_code = $_GET['subject_code'] ?? '';

if (empty($subject_code)) {
    echo json_encode(["success" => false, "message" => "Subject code is required"]);
    exit;
}

try {
    // First, get the class details including section
    $classStmt = $pdo->prepare("SELECT section, year_level FROM classes WHERE subject_code = ?");
    $classStmt->execute([$subject_code]);
    $class = $classStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$class) {
        echo json_encode(["success" => false, "message" => "Class not found"]);
        exit;
    }
    
    $section = $class['section'];
    
    // Get all students in this section from users table ONLY
    $studentsStmt = $pdo->prepare("
        SELECT user_ID, user_Name, YearandSection 
        FROM users 
        WHERE user_Role = 'Student' 
        AND YearandSection LIKE ?
    ");
    $studentsStmt->execute(['%' . $section]);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Students from users table matching section '$section': " . count($students));
    
    // Get activities
    $stmt = $pdo->prepare("SELECT * FROM activities WHERE subject_code = ? ORDER BY created_at DESC");
    $stmt->execute([$subject_code]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each activity, get or create student grade entries
    foreach ($activities as &$activity) {
        $activityStudents = [];
        
        foreach ($students as $student) {
            // Check if grade entry exists for this student and activity
            $gradeStmt = $pdo->prepare("
                SELECT * FROM activity_grades 
                WHERE activity_ID = ? AND student_ID = ?
            ");
            $gradeStmt->execute([$activity['id'], $student['user_ID']]);
            $gradeData = $gradeStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($gradeData) {
                // Use existing grade data
                $activityStudents[] = [
                    'user_ID' => $student['user_ID'],
                    'user_Name' => $student['user_Name'],
                    'grade' => $gradeData['grade'],
                    'submitted' => (bool)$gradeData['submitted'],
                    'late' => (bool)$gradeData['late']
                ];
            } else {
                // Create default entry if doesn't exist
                try {
                    $insertStmt = $pdo->prepare("
                        INSERT INTO activity_grades (activity_ID, student_ID, grade, submitted, late) 
                        VALUES (?, ?, NULL, 0, 0)
                    ");
                    $insertStmt->execute([$activity['id'], $student['user_ID']]);
                    
                    $activityStudents[] = [
                        'user_ID' => $student['user_ID'],
                        'user_Name' => $student['user_Name'],
                        'grade' => null,
                        'submitted' => false,
                        'late' => false
                    ];
                } catch (Exception $insertError) {
                    error_log("Error inserting grade for student {$student['user_ID']}: " . $insertError->getMessage());
                    // Continue with other students even if one fails
                    continue;
                }
            }
        }
        
        $activity['students'] = $activityStudents;
    }

    echo json_encode([
        "success" => true,
        "activities" => $activities,
        "debug" => [
            "class_section" => $section,
            "total_students_found" => count($students),
            "student_details" => $students,
            "total_activities" => count($activities)
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching activities: " . $e->getMessage()]);
}
?>