<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

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

if (empty($input['activity_ID']) || empty($input['students']) || !is_array($input['students'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields: activity_ID and students array"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Get the activity details including points
    $activityStmt = $pdo->prepare("SELECT points, title FROM activities WHERE id = ?");
    $activityStmt->execute([$input['activity_ID']]);
    $activity = $activityStmt->fetch(PDO::FETCH_ASSOC);

    if (!$activity) {
        throw new Exception("Activity not found");
    }

    // Determine the points to assign
    $points = $activity['points'];
    
    // If points is NULL or empty in database, use 100 as default
    if ($points === null || $points === '' || $points == 0) {
        $points = 100;
    }

    // Ensure points is a number
    $points = (float)$points;

    // Update all students for this activity - SET submitted_at to current timestamp
    $updateStmt = $pdo->prepare("
        UPDATE activity_grades 
        SET submitted = 1, 
            late = 0, 
            grade = :grade,
            submitted_at = NOW(),  -- FIX: Set submitted_at when marking as submitted
            updated_at = NOW()
        WHERE activity_ID = :activity_ID 
        AND student_ID = :student_ID
    ");

    $studentsUpdated = 0;
    $updatedStudents = [];

    foreach ($input['students'] as $student) {
        if (empty($student['user_ID'])) {
            continue;
        }

        try {
            $updateStmt->execute([
                ':grade' => $points,
                ':activity_ID' => $input['activity_ID'],
                ':student_ID' => $student['user_ID']
            ]);

            if ($updateStmt->rowCount() > 0) {
                $studentsUpdated++;
                $updatedStudents[] = [
                    'user_ID' => $student['user_ID'],
                    'user_Name' => $student['user_Name'] ?? 'Unknown',
                    'grade' => $points,
                    'submitted' => true,
                    'late' => false
                ];
            }
        } catch (Exception $e) {
            error_log("Error updating student {$student['user_ID']}: " . $e->getMessage());
            continue;
        }
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Successfully marked all students as submitted with " . $points . " points",
        "data" => [
            "activity_ID" => $input['activity_ID'],
            "points_assigned" => $points,
            "students_updated" => $studentsUpdated,
            "updated_students" => $updatedStudents
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error marking all as submitted: " . $e->getMessage()]);
}
?>