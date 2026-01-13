<?php
// DashboardProfDB/get_subject_performance.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'u713320770_tracked';
$username = 'u713320770_trackedDB';
$password = 'Tracked@2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!isset($_GET['professor_ID'])) {
        echo json_encode(['success' => false, 'message' => 'Professor ID is required']);
        exit;
    }

    $professorId = $_GET['professor_ID'];

    // Get all active classes for the professor
    $classQuery = "SELECT subject_code, subject, section, year_level, subject_semester 
                   FROM classes 
                   WHERE professor_ID = :professor_id AND status = 'Active'";
    $classStmt = $pdo->prepare($classQuery);
    $classStmt->bindParam(':professor_id', $professorId);
    $classStmt->execute();
    $classes = $classStmt->fetchAll(PDO::FETCH_ASSOC);

    $subjectsWithPerformance = [];

    foreach ($classes as $class) {
        $subjectCode = $class['subject_code'];
        
        // 1. Get all students enrolled in this subject
        $studentQuery = "SELECT student_ID 
                         FROM student_classes 
                         WHERE subject_code = :subject_code AND archived = 0";
        $studentStmt = $pdo->prepare($studentQuery);
        $studentStmt->bindParam(':subject_code', $subjectCode);
        $studentStmt->execute();
        $students = $studentStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $totalStudents = count($students);
        
        if ($totalStudents === 0) {
            // No students in this class, set default values
            $subjectsWithPerformance[] = [
                'subject_code' => $subjectCode,
                'subject' => $class['subject'],
                'section' => $class['section'],
                'year_level' => $class['year_level'],
                'subject_semester' => $class['subject_semester'],
                'total_percentage' => 0,
                'completion_rate' => 0,
                'total_activities' => 0,
                'completed_activities' => 0
            ];
            continue;
        }

        // 2. Get all non-archived activities for this subject
        $activityQuery = "SELECT id, points FROM activities 
                         WHERE subject_code = :subject_code 
                         AND professor_ID = :professor_id 
                         AND archived = 0";
        $activityStmt = $pdo->prepare($activityQuery);
        $activityStmt->bindParam(':subject_code', $subjectCode);
        $activityStmt->bindParam(':professor_id', $professorId);
        $activityStmt->execute();
        $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $totalActivities = count($activities);
        $activityIds = array_column($activities, 'id');

        // Initialize totals
        $totalClassPerformance = 0;

        // 3. Calculate performance for each student
        foreach ($students as $student) {
            $studentId = $student['student_ID'];
            $studentAcademicScore = 0;
            $studentTotalPossibleScore = 0;
            
            // Calculate academic performance (75% weight)
            if (!empty($activityIds)) {
                // Get all grades for this student for activities in this subject
                $activityIdPlaceholders = implode(',', array_fill(0, count($activityIds), '?'));
                $gradeQuery = "SELECT ag.activity_ID, ag.grade, a.points 
                              FROM activity_grades ag
                              JOIN activities a ON ag.activity_ID = a.id
                              WHERE ag.student_ID = ? 
                              AND ag.activity_ID IN ($activityIdPlaceholders)
                              AND ag.submitted = 1";
                
                $gradeStmt = $pdo->prepare($gradeQuery);
                $params = array_merge([$studentId], $activityIds);
                $gradeStmt->execute($params);
                $grades = $gradeStmt->fetchAll(PDO::FETCH_ASSOC);

                // Calculate academic percentage
                foreach ($activities as $activity) {
                    $activityId = $activity['id'];
                    $activityPoints = $activity['points'];
                    
                    // Find the grade for this activity
                    $grade = null;
                    foreach ($grades as $g) {
                        if ($g['activity_ID'] == $activityId) {
                            $grade = $g['grade'];
                            break;
                        }
                    }
                    
                    if ($grade !== null) {
                        // Convert grade to percentage
                        $gradePercentage = ($grade / $activityPoints) * 100;
                        $studentAcademicScore += min($gradePercentage, 100); // Cap at 100%
                    } else {
                        // Student hasn't submitted this activity, count as 0
                        $studentAcademicScore += 0;
                    }
                    
                    $studentTotalPossibleScore += 100; // Each activity contributes max 100%
                }
            }
            
            $academicPercentage = ($studentTotalPossibleScore > 0) 
                ? ($studentAcademicScore / $studentTotalPossibleScore) * 100 
                : 0;

            // 4. Calculate attendance performance (25% weight)
            // Get attendance records for this student in this subject
            $attendanceQuery = "SELECT status FROM attendance 
                               WHERE subject_code = :subject_code 
                               AND student_ID = :student_id";
            $attendanceStmt = $pdo->prepare($attendanceQuery);
            $attendanceStmt->bindParam(':subject_code', $subjectCode);
            $attendanceStmt->bindParam(':student_id', $studentId);
            $attendanceStmt->execute();
            $attendanceRecords = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $attendanceScore = 0;
            $attendanceTotalPossible = 0;
            
            foreach ($attendanceRecords as $record) {
                switch ($record['status']) {
                    case 'present':
                        $attendanceScore += 100;
                        break;
                    case 'late':
                        $attendanceScore += 50;
                        break;
                    case 'absent':
                        $attendanceScore += 0;
                        break;
                }
                $attendanceTotalPossible += 100;
            }
            
            $attendancePercentage = ($attendanceTotalPossible > 0) 
                ? ($attendanceScore / $attendanceTotalPossible) * 100 
                : 0;

            // 5. Calculate final performance (weighted: 75% academic, 25% attendance)
            $finalPerformance = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
            
            // Add to total class performance
            $totalClassPerformance += $finalPerformance;
        }

        // 6. Calculate class overall percentage
        $totalPerfectPerformance = $totalStudents * 100; // Each student can get max 100%
        $classPercentage = ($totalPerfectPerformance > 0) 
            ? ($totalClassPerformance / $totalPerfectPerformance) * 100 
            : 0;

        // 7. Count completed activities (activities with at least one submission)
        $completedActivitiesQuery = "SELECT COUNT(DISTINCT a.id) as completed_count
                                    FROM activities a
                                    JOIN activity_grades ag ON a.id = ag.activity_ID
                                    WHERE a.subject_code = :subject_code 
                                    AND a.professor_ID = :professor_id 
                                    AND a.archived = 0
                                    AND ag.submitted = 1";
        $completedStmt = $pdo->prepare($completedActivitiesQuery);
        $completedStmt->bindParam(':subject_code', $subjectCode);
        $completedStmt->bindParam(':professor_id', $professorId);
        $completedStmt->execute();
        $completedResult = $completedStmt->fetch(PDO::FETCH_ASSOC);
        $completedActivities = $completedResult['completed_count'];

        $subjectsWithPerformance[] = [
            'subject_code' => $subjectCode,
            'subject' => $class['subject'],
            'section' => $class['section'],
            'year_level' => $class['year_level'],
            'subject_semester' => $class['subject_semester'],
            'total_percentage' => round($classPercentage, 2),
            'completion_rate' => round($classPercentage, 2), // For backward compatibility
            'total_activities' => $totalActivities,
            'completed_activities' => $completedActivities,
            'total_students' => $totalStudents
        ];
    }

    echo json_encode([
        'success' => true,
        'subjects' => $subjectsWithPerformance
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>