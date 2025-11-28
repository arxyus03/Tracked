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
    // Get student ID and subject code from query parameters
    $student_id = $_GET['student_id'] ?? '';
    $subject_code = $_GET['subject_code'] ?? '';

    if (empty($student_id) || empty($subject_code)) {
        $response['success'] = false;
        $response['message'] = "Student ID and Subject Code are required";
        echo json_encode($response);
        exit();
    }

    // Verify student is enrolled in this class
    $check_query = "SELECT sc.* FROM student_classes sc 
                   WHERE sc.student_ID = ? AND sc.subject_code = ? AND sc.archived = 0";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("ss", $student_id, $subject_code);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows === 0) {
        $response['success'] = false;
        $response['message'] = "Student is not enrolled in this class or class does not exist";
        echo json_encode($response);
        $check_stmt->close();
        exit();
    }
    $check_stmt->close();

    // Get announcements for the specific classroom that the student is enrolled in
    $query = "SELECT 
                a.announcement_ID as id,
                a.title,
                a.description,
                a.link,
                a.deadline,
                DATE_FORMAT(a.created_at, '%Y-%m-%dT%H:%i:%sZ') as created_at_utc,
                DATE_FORMAT(a.deadline, '%Y-%m-%dT%H:%i:%sZ') as deadline_utc,
                CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by_fullname,
                t.tracked_lastname,
                t.tracked_gender,
                c.subject,
                c.section,
                c.subject_code
            FROM announcements a
            JOIN tracked_users t ON a.professor_ID = t.tracked_ID
            JOIN classes c ON a.classroom_ID = c.subject_code
            WHERE a.classroom_ID = ?
            ORDER BY a.created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $subject_code);
    $stmt->execute();
    $result = $stmt->get_result();

    $announcements = array();
    while ($row = $result->fetch_assoc()) {
        // Format posted_by with Ma'am/Sir + surname
        $postedBy = formatPostedBy($row['tracked_gender'], $row['tracked_lastname']);
        
        // Return raw UTC timestamps - frontend will convert to local time
        $announcements[] = array(
            'id' => $row['id'],
            'subject' => $row['subject'],
            'title' => $row['title'],
            'postedBy' => $postedBy,
            'datePosted' => $row['created_at_utc'], // Raw UTC timestamp
            'deadline' => $row['deadline_utc'], // Raw UTC timestamp
            'instructions' => $row['description'],
            'link' => $row['link'] ?: '#',
            'section' => $row['section'],
            'subject_code' => $row['subject_code']
        );
    }

    $response['success'] = true;
    $response['announcements'] = $announcements;

    $stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    error_log("Error in get_announcements_student.php: " . $e->getMessage());
}

echo json_encode($response);
$conn->close();

// Function to format posted by name with Ma'am/Sir
function formatPostedBy($gender, $lastname) {
    if (empty($lastname)) {
        return 'Unknown';
    }
    
    $title = 'Sir'; // Default to Sir
    if (strtolower($gender) === 'female') {
        $title = 'Ma\'am';
    }
    
    return $title . ' ' . $lastname;
}
?>