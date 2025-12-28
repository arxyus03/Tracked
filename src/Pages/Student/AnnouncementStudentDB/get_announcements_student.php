<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        handleGetRequest($conn);
    } elseif ($method === 'POST') {
        handlePostRequest($conn);
    } else {
        $response['success'] = false;
        $response['message'] = "Method not allowed";
        echo json_encode($response);
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    error_log("Error in get_announcements_student.php: " . $e->getMessage());
    echo json_encode($response);
}

$conn->close();

function handleGetRequest($conn) {
    global $response;
    
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
    // Include read status from announcement_read_status table
    $query = "SELECT 
                a.announcement_ID as id,
                a.title,
                a.description,
                a.link,
                a.deadline,
                a.created_at,
                CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by_fullname,
                t.tracked_lastname,
                t.tracked_gender,
                c.subject,
                c.section,
                c.subject_code,
                COALESCE(ars.is_read, 0) as is_read
            FROM announcements a
            JOIN tracked_users t ON a.professor_ID = t.tracked_ID
            JOIN classes c ON a.classroom_ID = c.subject_code
            LEFT JOIN announcement_read_status ars ON a.announcement_ID = ars.announcement_ID 
                AND ars.student_ID = ?
            WHERE a.classroom_ID = ?
            ORDER BY a.created_at DESC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $student_id, $subject_code);
    $stmt->execute();
    $result = $stmt->get_result();

    $announcements = array();
    while ($row = $result->fetch_assoc()) {
        // Format posted_by with Ma'am/Sir + surname
        $postedBy = formatPostedBy($row['tracked_gender'], $row['tracked_lastname']);
        
        $announcements[] = array(
            'id' => $row['id'],
            'subject' => $row['subject'],
            'title' => $row['title'],
            'postedBy' => $postedBy,
            'datePosted' => $row['created_at'],
            'deadline' => $row['deadline'],
            'instructions' => $row['description'],
            'link' => $row['link'] ?: '#',
            'section' => $row['section'],
            'subject_code' => $row['subject_code'],
            'isRead' => (bool)$row['is_read'] // Convert to boolean
        );
    }

    $response['success'] = true;
    $response['announcements'] = $announcements;

    $stmt->close();
    
    echo json_encode($response);
}

function handlePostRequest($conn) {
    global $response;
    
    // Get raw POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    $announcement_id = $data['announcement_id'] ?? '';
    $student_id = $data['student_id'] ?? '';
    $is_read = $data['is_read'] ?? 0;
    
    if (empty($announcement_id) || empty($student_id)) {
        $response['success'] = false;
        $response['message'] = "Announcement ID and Student ID are required";
        echo json_encode($response);
        exit();
    }
    
    // Check if record already exists
    $check_query = "SELECT id FROM announcement_read_status 
                    WHERE announcement_ID = ? AND student_ID = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("is", $announcement_id, $student_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        // Update existing record
        $update_query = "UPDATE announcement_read_status 
                        SET is_read = ?, read_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
                        updated_at = CURRENT_TIMESTAMP
                        WHERE announcement_ID = ? AND student_ID = ?";
        $update_stmt = $conn->prepare($update_query);
        $update_stmt->bind_param("iiis", $is_read, $is_read, $announcement_id, $student_id);
        
        if ($update_stmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Read status updated successfully";
        } else {
            $response['success'] = false;
            $response['message'] = "Failed to update read status: " . $update_stmt->error;
        }
        
        $update_stmt->close();
    } else {
        // Insert new record
        $insert_query = "INSERT INTO announcement_read_status 
                        (announcement_ID, student_ID, is_read, read_at) 
                        VALUES (?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)";
        $insert_stmt = $conn->prepare($insert_query);
        $insert_stmt->bind_param("isii", $announcement_id, $student_id, $is_read, $is_read);
        
        if ($insert_stmt->execute()) {
            $response['success'] = true;
            $response['message'] = "Read status saved successfully";
        } else {
            $response['success'] = false;
            $response['message'] = "Failed to save read status: " . $insert_stmt->error;
        }
        
        $insert_stmt->close();
    }
    
    $check_stmt->close();
    echo json_encode($response);
}

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