<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$database = "u713320770_tracked";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    $response = array(
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    );
    echo json_encode($response);
    exit();
}

$response = array();

try {
    // Get parameters
    $announcement_id = $_GET['announcement_id'] ?? '';
    $subject_code = $_GET['subject_code'] ?? '';
    
    if (empty($announcement_id) || empty($subject_code)) {
        $response['success'] = false;
        $response['message'] = "Announcement ID and Subject Code are required";
        echo json_encode($response);
        exit();
    }
    
    // Get all students in the class
    $students_query = "SELECT 
                        s.tracked_ID as student_id,
                        CONCAT(s.tracked_firstname, ' ', s.tracked_lastname) as student_name,
                        s.tracked_lastname,
                        s.tracked_gender,
                        COALESCE(ars.is_read, 0) as is_read,
                        ars.read_at
                      FROM tracked_users s
                      INNER JOIN student_classes sc ON s.tracked_ID = sc.student_ID 
                        AND sc.subject_code = ? AND sc.archived = 0
                      LEFT JOIN announcement_read_status ars ON s.tracked_ID = ars.student_ID 
                        AND ars.announcement_ID = ?
                      ORDER BY s.tracked_lastname, s.tracked_firstname";
    
    $stmt = $conn->prepare($students_query);
    $stmt->bind_param("si", $subject_code, $announcement_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $read_status = array();
    $total_students = 0;
    $read_count = 0;
    
    while ($row = $result->fetch_assoc()) {
        $total_students++;
        if ($row['is_read']) {
            $read_count++;
        }
        
        $read_status[] = array(
            'student_id' => $row['student_id'],
            'student_name' => $row['student_name'],
            'is_read' => (bool)$row['is_read'],
            'read_at' => $row['read_at'],
            'status_text' => $row['is_read'] ? 'Read' : 'Unread'
        );
    }
    
    $response['success'] = true;
    $response['read_status'] = $read_status;
    $response['summary'] = array(
        'total_students' => $total_students,
        'read_count' => $read_count,
        'unread_count' => $total_students - $read_count,
        'read_percentage' => $total_students > 0 ? round(($read_count / $total_students) * 100, 0) : 0
    );
    
    $stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    error_log("Error in get_read_status.php: " . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>