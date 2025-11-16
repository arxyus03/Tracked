<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

try {
    // Count professors and students with status
    $profQuery = "SELECT tracked_Status, COUNT(*) AS count FROM tracked_users WHERE tracked_Role = 'Professor' GROUP BY tracked_Status";
    $studQuery = "SELECT tracked_Status, COUNT(*) AS count FROM tracked_users WHERE tracked_Role = 'Student' GROUP BY tracked_Status";

    $profResult = $conn->query($profQuery);
    $studResult = $conn->query($studQuery);

    // Check for query errors
    if (!$profResult) {
        throw new Exception("Professor query failed: " . $conn->error);
    }
    
    if (!$studResult) {
        throw new Exception("Student query failed: " . $conn->error);
    }

    // Initialize counts
    $professors = 0;
    $students = 0;
    $activeProfessors = 0;
    $deactivatedProfessors = 0;
    $activeStudents = 0;
    $deactivatedStudents = 0;

    // Process professor counts
    while ($row = $profResult->fetch_assoc()) {
        $professors += $row['count'];
        if ($row['tracked_Status'] === 'Active') {
            $activeProfessors = $row['count'];
        } else if ($row['tracked_Status'] === 'Deactivate') {
            $deactivatedProfessors = $row['count'];
        }
    }

    // Process student counts
    while ($row = $studResult->fetch_assoc()) {
        $students += $row['count'];
        if ($row['tracked_Status'] === 'Active') {
            $activeStudents = $row['count'];
        } else if ($row['tracked_Status'] === 'Deactivate') {
            $deactivatedStudents = $row['count'];
        }
    }

    // Return success response
    echo json_encode([
        "success" => true,
        "Professors" => $professors,
        "Students" => $students,
        "ActiveProfessors" => $activeProfessors,
        "DeactivatedProfessors" => $deactivatedProfessors,
        "ActiveStudents" => $activeStudents,
        "DeactivatedStudents" => $deactivatedStudents,
        "TotalActive" => $activeProfessors + $activeStudents,
        "TotalDeactivated" => $deactivatedProfessors + $deactivatedStudents
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>