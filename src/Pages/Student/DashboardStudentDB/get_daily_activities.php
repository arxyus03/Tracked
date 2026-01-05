<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $student_id = $_GET['student_id'] ?? '';
    $date = $_GET['date'] ?? '';

    if (empty($student_id)) {
        echo json_encode(['success' => false, 'message' => 'Student ID is required']);
        exit;
    }
    
    // Get enrolled subjects from student_classes table
    $subjectQuery = "SELECT subject_code FROM student_classes WHERE student_ID = :student_id AND (archived = 0 OR archived IS NULL)";
    $subjectStmt = $conn->prepare($subjectQuery);
    $subjectStmt->bindParam(':student_id', $student_id);
    $subjectStmt->execute();
    $subjects = $subjectStmt->fetchAll(PDO::FETCH_COLUMN);
    
    $activities = [];
    
    if (!empty($subjects)) {
        $placeholders = str_repeat('?,', count($subjects) - 1) . '?';
        
        if (!empty($date)) {
            // Check both created_at and deadline dates
            $activityQuery = "
                SELECT 
                    a.id,
                    a.subject_code,
                    c.subject,
                    a.activity_type,
                    a.title,
                    a.task_number,
                    a.created_at,
                    a.deadline,
                    a.points,
                    COALESCE(ag.submitted, 0) as submitted,
                    ag.grade,
                    (
                        SELECT COUNT(*) 
                        FROM activity_files af 
                        WHERE af.activity_id = a.id 
                        AND af.student_id = ? 
                        AND af.uploaded_by = 'professor'
                    ) as professor_file_count
                FROM activities a
                JOIN classes c ON a.subject_code = c.subject_code
                LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
                WHERE a.subject_code IN ($placeholders)
                AND (DATE(a.created_at) = ? OR DATE(a.deadline) = ?)
                AND (a.archived = 0 OR a.archived IS NULL)
                ORDER BY a.created_at DESC
            ";
            
            $activityStmt = $conn->prepare($activityQuery);
            $params = array_merge([$student_id, $student_id], $subjects, [$date, $date]);
            
            for ($i = 1; $i <= count($params); $i++) {
                $activityStmt->bindValue($i, $params[$i-1]);
            }
            
            $activityStmt->execute();
        } else {
            $activityQuery = "
                SELECT 
                    a.id,
                    a.subject_code,
                    c.subject,
                    a.activity_type,
                    a.title,
                    a.task_number,
                    a.created_at,
                    a.deadline,
                    a.points,
                    COALESCE(ag.submitted, 0) as submitted,
                    ag.grade,
                    (
                        SELECT COUNT(*) 
                        FROM activity_files af 
                        WHERE af.activity_id = a.id 
                        AND af.student_id = ? 
                        AND af.uploaded_by = 'professor'
                    ) as professor_file_count
                FROM activities a
                JOIN classes c ON a.subject_code = c.subject_code
                LEFT JOIN activity_grades ag ON a.id = ag.activity_ID AND ag.student_ID = ?
                WHERE a.subject_code IN ($placeholders)
                AND (a.archived = 0 OR a.archived IS NULL)
                ORDER BY a.created_at DESC
            ";
            
            $activityStmt = $conn->prepare($activityQuery);
            $params = array_merge([$student_id, $student_id], $subjects);
            
            for ($i = 1; $i <= count($params); $i++) {
                $activityStmt->bindValue($i, $params[$i-1]);
            }
            
            $activityStmt->execute();
        }
        
        $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'activities' => $activities,
        'count' => count($activities)
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>