<?php
// DashboardProfDB/get_calendar_attendance.php
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
    $month = isset($_GET['month']) ? (int)$_GET['month'] : date('m');
    $year = isset($_GET['year']) ? (int)$_GET['year'] : date('Y');
    $date = isset($_GET['date']) ? $_GET['date'] : null;
    $subjectName = isset($_GET['subject_name']) ? $_GET['subject_name'] : null;
    $section = isset($_GET['section']) ? $_GET['section'] : null;

    // If just getting subjects, return them grouped by subject name
    if (!isset($_GET['get_attendance_only'])) {
        // Get all subjects handled by the professor
        $subjectsQuery = "SELECT DISTINCT 
                         c.subject_code, 
                         c.subject, 
                         c.section,
                         c.year_level
                         FROM classes c
                         WHERE c.professor_ID = :professor_id 
                         AND c.status = 'Active'
                         ORDER BY c.subject, c.section";
        $subjectsStmt = $pdo->prepare($subjectsQuery);
        $subjectsStmt->bindParam(':professor_id', $professorId);
        $subjectsStmt->execute();
        $subjects = $subjectsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Group by subject name - ONE entry per subject with all its sections
        $groupedSubjects = [];
        foreach ($subjects as $subject) {
            $subjectName = $subject['subject'];
            $subjectCode = $subject['subject_code'];
            
            if (!isset($groupedSubjects[$subjectName])) {
                $groupedSubjects[$subjectName] = [
                    'subject_name' => $subjectName,
                    'subject_codes' => [], // Store all subject codes for this subject name
                    'sections' => []
                ];
            }
            
            // Add this subject code if not already in the array
            if (!in_array($subjectCode, $groupedSubjects[$subjectName]['subject_codes'])) {
                $groupedSubjects[$subjectName]['subject_codes'][] = $subjectCode;
            }
            
            // Add this section if not already in the array
            if (!in_array($subject['section'], $groupedSubjects[$subjectName]['sections'])) {
                $groupedSubjects[$subjectName]['sections'][] = $subject['section'];
            }
        }
        
        // Convert to indexed array
        $subjectsList = array_values($groupedSubjects);
        
        echo json_encode([
            'success' => true,
            'subjects' => $subjectsList,
            'debug' => ['professor_id' => $professorId, 'total_subjects' => count($subjectsList)]
        ]);
        exit;
    }

    // If getting attendance data
    if (!$date) {
        echo json_encode(['success' => false, 'message' => 'Date is required']);
        exit;
    }

    // Get monthly absence rate (counts days with absent/late only)
    $monthStart = date('Y-m-01', strtotime($date));
    $monthEnd = date('Y-m-t', strtotime($date));
    
    $monthlyQuery = "SELECT 
                    COUNT(DISTINCT attendance_date) as total_days_with_attendance,
                    COUNT(DISTINCT CASE WHEN status IN ('absent', 'late') THEN attendance_date END) as days_with_issues
                    FROM attendance 
                    WHERE professor_ID = :professor_id
                    AND attendance_date BETWEEN :month_start AND :month_end";
    
    $monthlyStmt = $pdo->prepare($monthlyQuery);
    $monthlyStmt->bindParam(':professor_id', $professorId);
    $monthlyStmt->bindParam(':month_start', $monthStart);
    $monthlyStmt->bindParam(':month_end', $monthEnd);
    $monthlyStmt->execute();
    $monthlyData = $monthlyStmt->fetch(PDO::FETCH_ASSOC);
    
    $monthlyAbsenceRate = 0;
    if ($monthlyData['total_days_with_attendance'] > 0) {
        $monthlyAbsenceRate = round(($monthlyData['days_with_issues'] / $monthlyData['total_days_with_attendance']) * 100);
    }

    // If no subject selected, get ONLY absent/late attendance for the specific date
    if (!$subjectName) {
        $attendanceQuery = "SELECT 
                           a.id,
                           a.student_ID,
                           a.subject_code,
                           a.attendance_date,
                           a.status,
                           a.created_at,
                           tu.tracked_firstname,
                           tu.tracked_lastname,
                           tu.tracked_yearandsec,
                           c.subject,
                           c.section
                           FROM attendance a
                           JOIN tracked_users tu ON a.student_ID = tu.tracked_ID
                           JOIN classes c ON a.subject_code = c.subject_code
                           WHERE a.professor_ID = :professor_id
                           AND a.attendance_date = :attendance_date
                           AND a.status IN ('absent', 'late')  -- ONLY absent/late
                           AND tu.tracked_Role = 'Student'
                           ORDER BY c.subject, c.section, tu.tracked_lastname";
        
        $attendanceStmt = $pdo->prepare($attendanceQuery);
        $attendanceStmt->bindParam(':professor_id', $professorId);
        $attendanceStmt->bindParam(':attendance_date', $date);
        $attendanceStmt->execute();
        $attendanceData = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'date' => $date,
            'attendance' => $attendanceData,
            'monthly_absence_rate' => $monthlyAbsenceRate,
            'total_students' => count($attendanceData),
            'debug' => [
                'professor_id' => $professorId,
                'date_queried' => $date,
                'attendance_count' => count($attendanceData),
                'monthly_rate' => $monthlyAbsenceRate
            ]
        ]);
        exit;
    }

    // If subject is selected but no section, get all sections for that subject name
    if ($subjectName && !$section) {
        // Get ALL subject codes and sections for this subject name
        $subjectCodesQuery = "SELECT DISTINCT subject_code FROM classes 
                            WHERE subject = :subject_name 
                            AND professor_ID = :professor_id
                            ORDER BY subject_code";
        $subjectCodesStmt = $pdo->prepare($subjectCodesQuery);
        $subjectCodesStmt->bindParam(':subject_name', $subjectName);
        $subjectCodesStmt->bindParam(':professor_id', $professorId);
        $subjectCodesStmt->execute();
        $subjectCodes = $subjectCodesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get all sections for this subject name
        $sectionsQuery = "SELECT DISTINCT section FROM classes 
                         WHERE subject = :subject_name 
                         AND professor_ID = :professor_id
                         ORDER BY section";
        $sectionsStmt = $pdo->prepare($sectionsQuery);
        $sectionsStmt->bindParam(':subject_name', $subjectName);
        $sectionsStmt->bindParam(':professor_id', $professorId);
        $sectionsStmt->execute();
        $allSections = $sectionsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $sections = [];
        
        foreach ($allSections as $sectionData) {
            $sectionName = $sectionData['section'];
            
            // Get attendance for this specific section (only absent/late)
            // Need to check all subject codes for this subject name
            $subjectCodeList = array_column($subjectCodes, 'subject_code');
            
            if (empty($subjectCodeList)) {
                // No subject codes found for this subject name
                $sections[$sectionName] = [
                    'section' => $sectionName,
                    'students' => [],
                    'absent_count' => 0,
                    'late_count' => 0,
                    'total_students' => 0
                ];
                continue;
            }
            
            // Create named parameters for the IN clause
            $subjectCodePlaceholders = [];
            foreach ($subjectCodeList as $key => $value) {
                $subjectCodePlaceholders[] = ':subject_code_' . $key;
            }
            $subjectCodePlaceholdersStr = implode(',', $subjectCodePlaceholders);
            
            $sectionAttendanceQuery = "SELECT 
                                      a.id,
                                      a.student_ID,
                                      a.subject_code,
                                      a.attendance_date,
                                      a.status,
                                      a.created_at,
                                      tu.tracked_firstname,
                                      tu.tracked_lastname,
                                      tu.tracked_yearandsec,
                                      c.subject,
                                      c.section
                                      FROM attendance a
                                      JOIN tracked_users tu ON a.student_ID = tu.tracked_ID
                                      JOIN classes c ON a.subject_code = c.subject_code
                                      WHERE a.professor_ID = :professor_id
                                      AND a.attendance_date = :attendance_date
                                      AND a.subject_code IN ($subjectCodePlaceholdersStr)
                                      AND c.section = :section
                                      AND a.status IN ('absent', 'late')  -- ONLY absent/late
                                      AND tu.tracked_Role = 'Student'
                                      ORDER BY tu.tracked_lastname";
            
            $sectionAttendanceStmt = $pdo->prepare($sectionAttendanceQuery);
            
            // Bind all parameters
            $sectionAttendanceStmt->bindParam(':professor_id', $professorId);
            $sectionAttendanceStmt->bindParam(':attendance_date', $date);
            $sectionAttendanceStmt->bindParam(':section', $sectionName);
            
            // Bind each subject code parameter
            foreach ($subjectCodeList as $key => $value) {
                $sectionAttendanceStmt->bindValue(':subject_code_' . $key, $value);
            }
            
            $sectionAttendanceStmt->execute();
            $sectionAttendance = $sectionAttendanceStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate counts
            $absentCount = 0;
            $lateCount = 0;
            
            foreach ($sectionAttendance as $record) {
                if ($record['status'] === 'absent') {
                    $absentCount++;
                } elseif ($record['status'] === 'late') {
                    $lateCount++;
                }
            }
            
            $sections[$sectionName] = [
                'section' => $sectionName,
                'students' => $sectionAttendance,
                'absent_count' => $absentCount,
                'late_count' => $lateCount,
                'total_students' => count($sectionAttendance)
            ];
        }

        echo json_encode([
            'success' => true,
            'date' => $date,
            'subject_name' => $subjectName,
            'subject_codes' => array_column($subjectCodes, 'subject_code'),
            'sections' => array_values($sections),
            'total_sections' => count($sections),
            'monthly_absence_rate' => $monthlyAbsenceRate
        ]);
        exit;
    }

    // If both subject and section are selected
    if ($subjectName && $section) {
        // Get all subject codes for this subject name
        $subjectCodesQuery = "SELECT DISTINCT subject_code FROM classes 
                            WHERE subject = :subject_name 
                            AND professor_ID = :professor_id
                            ORDER BY subject_code";
        $subjectCodesStmt = $pdo->prepare($subjectCodesQuery);
        $subjectCodesStmt->bindParam(':subject_name', $subjectName);
        $subjectCodesStmt->bindParam(':professor_id', $professorId);
        $subjectCodesStmt->execute();
        $subjectCodes = $subjectCodesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($subjectCodes)) {
            echo json_encode([
                'success' => false,
                'message' => 'No subject codes found for this subject name'
            ]);
            exit;
        }
        
        $subjectCodeList = array_column($subjectCodes, 'subject_code');
        
        // Create named parameters for the IN clause
        $subjectCodePlaceholders = [];
        foreach ($subjectCodeList as $key => $value) {
            $subjectCodePlaceholders[] = ':subject_code_' . $key;
        }
        $subjectCodePlaceholdersStr = implode(',', $subjectCodePlaceholders);
        
        // Get attendance for the specific date, subject name, and section (only absent/late)
        $attendanceQuery = "SELECT 
                           a.id,
                           a.student_ID,
                           a.subject_code,
                           a.attendance_date,
                           a.status,
                           a.created_at,
                           tu.tracked_firstname,
                           tu.tracked_lastname,
                           tu.tracked_yearandsec,
                           c.subject,
                           c.section
                           FROM attendance a
                           JOIN tracked_users tu ON a.student_ID = tu.tracked_ID
                           JOIN classes c ON a.subject_code = c.subject_code
                           WHERE a.professor_ID = :professor_id
                           AND a.attendance_date = :attendance_date
                           AND a.subject_code IN ($subjectCodePlaceholdersStr)
                           AND c.section = :section
                           AND a.status IN ('absent', 'late')  -- ONLY absent/late
                           AND tu.tracked_Role = 'Student'
                           ORDER BY tu.tracked_lastname";
        
        $attendanceStmt = $pdo->prepare($attendanceQuery);
        
        // Bind all parameters
        $attendanceStmt->bindParam(':professor_id', $professorId);
        $attendanceStmt->bindParam(':attendance_date', $date);
        $attendanceStmt->bindParam(':section', $section);
        
        // Bind each subject code parameter
        foreach ($subjectCodeList as $key => $value) {
            $attendanceStmt->bindValue(':subject_code_' . $key, $value);
        }
        
        $attendanceStmt->execute();
        $attendanceData = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate status counts
        $absentCount = 0;
        $lateCount = 0;
        
        foreach ($attendanceData as $record) {
            if ($record['status'] === 'absent') {
                $absentCount++;
            } elseif ($record['status'] === 'late') {
                $lateCount++;
            }
        }

        echo json_encode([
            'success' => true,
            'date' => $date,
            'subject_name' => $subjectName,
            'subject_codes' => $subjectCodeList,
            'section' => $section,
            'students' => $attendanceData,
            'absent_count' => $absentCount,
            'late_count' => $lateCount,
            'total_students' => count($attendanceData),
            'monthly_absence_rate' => $monthlyAbsenceRate
        ]);
        exit;
    }

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