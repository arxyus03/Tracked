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
    // Get professor ID and classroom ID from query parameters
    $professor_ID = $_GET['professor_ID'] ?? '';
    $classroom_ID = $_GET['classroom_ID'] ?? '';

    if (empty($professor_ID)) {
        $response['success'] = false;
        $response['message'] = "Professor ID is required";
        echo json_encode($response);
        exit();
    }

    // Build query based on whether classroom_ID is provided
    if (empty($classroom_ID)) {
        // Get all announcements for the professor across all classes
        $query = "SELECT 
                    a.announcement_ID,
                    a.title,
                    a.description,
                    a.link,
                    a.deadline,
                    a.created_at,
                    CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by,
                    c.subject,
                    c.section,
                    c.subject_code
                  FROM announcements a
                  JOIN tracked_users t ON a.professor_ID = t.tracked_ID
                  JOIN classes c ON a.classroom_ID = c.subject_code
                  WHERE a.professor_ID = ?
                  ORDER BY a.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $professor_ID);
    } else {
        // Validate professor access to classroom
        $check_query = "SELECT * FROM classes WHERE subject_code = ? AND professor_ID = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bind_param("ss", $classroom_ID, $professor_ID);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();

        if ($check_result->num_rows === 0) {
            $response['success'] = false;
            $response['message'] = "Professor does not have access to this classroom";
            echo json_encode($response);
            $check_stmt->close();
            exit();
        }
        $check_stmt->close();

        // Get announcements for specific classroom
        $query = "SELECT 
                    a.announcement_ID,
                    a.title,
                    a.description,
                    a.link,
                    a.deadline,
                    a.created_at,
                    CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by,
                    c.subject,
                    c.section,
                    c.subject_code
                FROM announcements a
                JOIN tracked_users t ON a.professor_ID = t.tracked_ID
                JOIN classes c ON a.classroom_ID = c.subject_code
                WHERE a.professor_ID = ? AND a.classroom_ID = ?
                ORDER BY a.created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $professor_ID, $classroom_ID);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $announcements = array();
    while ($row = $result->fetch_assoc()) {
        // Format dates for display
        $row['datePosted'] = date('F j, Y', strtotime($row['created_at']));
        
        if ($row['deadline']) {
            $deadline_date = date('F j, Y', strtotime($row['deadline']));
            $deadline_time = date('g:ia', strtotime($row['deadline']));
            $row['deadline'] = $deadline_date . ' | ' . $deadline_time;
        } else {
            $row['deadline'] = null;
        }

        $announcements[] = array(
            'id' => $row['announcement_ID'],
            'subject' => $row['subject'],
            'title' => $row['title'],
            'postedBy' => $row['posted_by'],
            'datePosted' => $row['datePosted'],
            'deadline' => $row['deadline'],
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
}

echo json_encode($response);
$conn->close();
?>