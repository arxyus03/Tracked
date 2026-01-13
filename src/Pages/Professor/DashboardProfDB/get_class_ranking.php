<?php
// DashboardProfDB/get_class_ranking.php
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
    $subjectCode = isset($_GET['subject_code']) ? $_GET['subject_code'] : null;
    $rankingType = isset($_GET['type']) ? $_GET['type'] : 'lowest'; // 'highest' or 'lowest'
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;

    // Get all active classes for the professor
    $classQuery = "SELECT subject_code, subject, section 
                   FROM classes 
                   WHERE professor_ID = :professor_id AND status = 'Active'";
    $classStmt = $pdo->prepare($classQuery);
    $classStmt->bindParam(':professor_id', $professorId);
    $classStmt->execute();
    $classes = $classStmt->fetchAll(PDO::FETCH_ASSOC);

    // Return all subjects for dropdown
    if (!isset($_GET['get_subjects_only'])) {
        $subjects = array_map(function($class) {
            return [
                'subject_code' => $class['subject_code'],
                'subject' => $class['subject'],
                'section' => $class['section']
            ];
        }, $classes);

        echo json_encode([
            'success' => true,
            'subjects' => $subjects
        ]);
        exit;
    }

    // If no subject selected, get the first one
    if (!$subjectCode && count($classes) > 0) {
        $subjectCode = $classes[0]['subject_code'];
    }

    // Get class info for the selected subject
    $classInfo = null;
    foreach ($classes as $class) {
        if ($class['subject_code'] === $subjectCode) {
            $classInfo = $class;
            break;
        }
    }

    if (!$classInfo) {
        echo json_encode([
            'success' => false,
            'message' => 'Subject not found'
        ]);
        exit;
    }

    // Get all students enrolled in this subject
    $studentQuery = "SELECT sc.student_ID, 
                     tu.tracked_firstname, tu.tracked_lastname, 
                     tu.tracked_email, tu.tracked_yearandsec
                     FROM student_classes sc
                     JOIN tracked_users tu ON sc.student_ID = tu.tracked_ID
                     WHERE sc.subject_code = :subject_code 
                     AND sc.archived = 0
                     AND tu.tracked_Role = 'Student'";
    $studentStmt = $pdo->prepare($studentQuery);
    $studentStmt->bindParam(':subject_code', $subjectCode);
    $studentStmt->execute();
    $students = $studentStmt->fetchAll(PDO::FETCH_ASSOC);

    $studentsWithPerformance = [];

    foreach ($students as $student) {
        $studentId = $student['student_ID'];
        
        // 1. Get all non-archived activities for this subject
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

        // 2. Calculate attendance performance (25% weight)
        // Get attendance records for this student in this subject
        $attendanceQuery = "SELECT COUNT(*) as total, 
                           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                           SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                           SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count
                           FROM attendance 
                           WHERE subject_code = :subject_code 
                           AND student_ID = :student_id";
        $attendanceStmt = $pdo->prepare($attendanceQuery);
        $attendanceStmt->bindParam(':subject_code', $subjectCode);
        $attendanceStmt->bindParam(':student_id', $studentId);
        $attendanceStmt->execute();
        $attendanceResult = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
        
        $attendanceTotal = $attendanceResult['total'];
        $attendanceScore = 0;
        $attendanceTotalPossible = 0;
        
        if ($attendanceTotal > 0) {
            // Calculate attendance points
            $presentCount = $attendanceResult['present_count'] ?: 0;
            $lateCount = $attendanceResult['late_count'] ?: 0;
            $absentCount = $attendanceResult['absent_count'] ?: 0;
            
            $attendanceScore = ($presentCount * 100) + ($lateCount * 50) + ($absentCount * 0);
            $attendanceTotalPossible = $attendanceTotal * 100;
        }
        
        $attendancePercentage = ($attendanceTotalPossible > 0) 
            ? ($attendanceScore / $attendanceTotalPossible) * 100 
            : 0;

        // 3. Calculate final performance (weighted: 75% academic, 25% attendance)
        $finalPerformance = ($academicPercentage * 0.75) + ($attendancePercentage * 0.25);
        
        // 4. Get activity statistics
        $submittedActivitiesQuery = "SELECT COUNT(DISTINCT ag.activity_ID) as submitted_count
                                    FROM activity_grades ag
                                    JOIN activities a ON ag.activity_ID = a.id
                                    WHERE a.subject_code = :subject_code 
                                    AND a.professor_ID = :professor_id 
                                    AND a.archived = 0
                                    AND ag.student_ID = :student_id
                                    AND ag.submitted = 1";
        $submittedStmt = $pdo->prepare($submittedActivitiesQuery);
        $submittedStmt->bindParam(':subject_code', $subjectCode);
        $submittedStmt->bindParam(':professor_id', $professorId);
        $submittedStmt->bindParam(':student_id', $studentId);
        $submittedStmt->execute();
        $submittedResult = $submittedStmt->fetch(PDO::FETCH_ASSOC);
        $submittedActivities = $submittedResult['submitted_count'] ?: 0;
        
        // 5. Get grade breakdown for quizzes, assignments, projects
        $gradeBreakdownQuery = "SELECT 
                               AVG(CASE WHEN a.activity_type = 'Quiz' THEN ag.grade END) as quiz_avg,
                               AVG(CASE WHEN a.activity_type = 'Assignment' THEN ag.grade END) as assignment_avg,
                               AVG(CASE WHEN a.activity_type = 'Project' THEN ag.grade END) as project_avg,
                               AVG(CASE WHEN a.activity_type IN ('Activity', 'Laboratory', 'Discussion', 'Exam') THEN ag.grade END) as other_avg
                               FROM activity_grades ag
                               JOIN activities a ON ag.activity_ID = a.id
                               WHERE a.subject_code = :subject_code 
                               AND a.professor_ID = :professor_id 
                               AND a.archived = 0
                               AND ag.student_ID = :student_id
                               AND ag.submitted = 1";
        $gradeBreakdownStmt = $pdo->prepare($gradeBreakdownQuery);
        $gradeBreakdownStmt->bindParam(':subject_code', $subjectCode);
        $gradeBreakdownStmt->bindParam(':professor_id', $professorId);
        $gradeBreakdownStmt->bindParam(':student_id', $studentId);
        $gradeBreakdownStmt->execute();
        $gradeBreakdown = $gradeBreakdownStmt->fetch(PDO::FETCH_ASSOC);
        
        // Convert grades to percentages
        $quizPercentage = $gradeBreakdown['quiz_avg'] ? round($gradeBreakdown['quiz_avg']) : 0;
        $assignmentPercentage = $gradeBreakdown['assignment_avg'] ? round($gradeBreakdown['assignment_avg']) : 0;
        $projectPercentage = $gradeBreakdown['project_avg'] ? round($gradeBreakdown['project_avg']) : 0;
        $otherPercentage = $gradeBreakdown['other_avg'] ? round($gradeBreakdown['other_avg']) : 0;

        $studentsWithPerformance[] = [
            'id' => $studentId,
            'name' => $student['tracked_firstname'] . ' ' . $student['tracked_lastname'],
            'email' => $student['tracked_email'],
            'subject' => $classInfo['subject'],
            'section' => $classInfo['section'],
            'average' => round($finalPerformance, 2),
            'briefReason' => $finalPerformance < 70 ? 'Below average performance' : 
                           ($finalPerformance < 80 ? 'Average performance' : 'Good performance'),
            'details' => [
                'attendance' => [
                    'rate' => round($attendancePercentage, 2),
                    'absences' => $attendanceResult['absent_count'] ?: 0,
                    'lates' => $attendanceResult['late_count'] ?: 0,
                    'totalClasses' => $attendanceTotal,
                    'present' => $attendanceResult['present_count'] ?: 0
                ],
                'grades' => [
                    'quizzes' => $quizPercentage,
                    'assignments' => $assignmentPercentage,
                    'projects' => $projectPercentage,
                    'other' => $otherPercentage
                ],
                'activities' => [
                    'submitted' => $submittedActivities,
                    'total' => $totalActivities,
                    'missed' => $totalActivities - $submittedActivities
                ]
            ]
        ];
    }

    // Sort students by performance
    usort($studentsWithPerformance, function($a, $b) use ($rankingType) {
        if ($rankingType === 'highest') {
            return $b['average'] <=> $a['average']; // Descending for highest
        } else {
            return $a['average'] <=> $b['average']; // Ascending for lowest
        }
    });

    // Get top N students
    $topStudents = array_slice($studentsWithPerformance, 0, $limit);

    echo json_encode([
        'success' => true,
        'ranking_type' => $rankingType,
        'subject' => [
            'code' => $subjectCode,
            'name' => $classInfo['subject'],
            'section' => $classInfo['section']
        ],
        'students' => $topStudents,
        'total_students' => count($students),
        'average_performance' => count($studentsWithPerformance) > 0 
            ? round(array_sum(array_column($studentsWithPerformance, 'average')) / count($studentsWithPerformance), 2)
            : 0
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