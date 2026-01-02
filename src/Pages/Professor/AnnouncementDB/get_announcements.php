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

// Set timezone to UTC for consistency
date_default_timezone_set('UTC');

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
                    a.announcement_ID as id,
                    a.title,
                    a.description,
                    a.link,
                    a.deadline,
                    a.created_at,
                    a.updated_at,
                    CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by_fullname,
                    c.subject,
                    c.section,
                    c.subject_code,
                    t.tracked_lastname as prof_lastname
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
            $response['message'] = "Professor does not have access to this classroom or classroom does not exist";
            $response['debug'] = array(
                'professor_ID' => $professor_ID,
                'classroom_ID' => $classroom_ID
            );
            echo json_encode($response);
            $check_stmt->close();
            exit();
        }
        $check_stmt->close();

        // Get announcements for specific classroom
        $query = "SELECT 
                    a.announcement_ID as id,
                    a.title,
                    a.description,
                    a.link,
                    a.deadline,
                    a.created_at,
                    a.updated_at,
                    CONCAT(t.tracked_lastname, ', ', t.tracked_firstname, ' ', COALESCE(t.tracked_middlename, '')) as posted_by_fullname,
                    c.subject,
                    c.section,
                    c.subject_code,
                    t.tracked_lastname as prof_lastname
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
        // Format posted_by name for professor side
        $postedBy = 'Prof. ' . $row['prof_lastname'];
        
        // Convert MySQL datetime to ISO 8601 format in UTC
        $createdAt = $row['created_at'];
        $updatedAt = $row['updated_at'];
        $deadline = $row['deadline'];
        
        // Format dates properly
        $formattedCreatedAt = date('c', strtotime($createdAt)); // ISO 8601 format
        $formattedUpdatedAt = date('c', strtotime($updatedAt)); // ISO 8601 format
        $formattedDeadline = $deadline ? date('c', strtotime($deadline)) : null;
        
        $announcements[] = array(
            'id' => $row['id'],
            'subject' => $row['subject'],
            'title' => $row['title'],
            'postedBy' => $postedBy,
            'postedByFull' => $row['posted_by_fullname'],
            'datePosted' => $formattedCreatedAt, // Use formatted ISO date
            'deadline' => $formattedDeadline,
            'description' => $row['description'],
            'instructions' => $row['description'], // For compatibility
            'link' => $row['link'] ?: '#',
            'section' => $row['section'],
            'subject_code' => $row['subject_code'],
            'updated_at' => $formattedUpdatedAt
        );
    }

    $response['success'] = true;
    $response['announcements'] = $announcements;
    $response['debug'] = array(
        'professor_ID' => $professor_ID,
        'classroom_ID' => $classroom_ID,
        'count' => count($announcements),
        'timezone' => date_default_timezone_get()
    );

    $stmt->close();

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Server error: " . $e->getMessage();
    error_log("Error in get_announcements.php: " . $e->getMessage());
}

echo json_encode($response);
$conn->close();
?>