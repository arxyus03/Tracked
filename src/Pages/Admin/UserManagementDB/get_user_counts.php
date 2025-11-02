<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tracked";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Count professors and students
$profQuery = "SELECT COUNT(*) AS count FROM tracked_users WHERE tracked_Role = 'Professor'";
$studQuery = "SELECT COUNT(*) AS count FROM tracked_users WHERE tracked_Role = 'Student'";

$profResult = $conn->query($profQuery);
$studResult = $conn->query($studQuery);

$professors = $profResult ? $profResult->fetch_assoc()['count'] : 0;
$students = $studResult ? $studResult->fetch_assoc()['count'] : 0;

echo json_encode([
  "Professors" => $professors,
  "Students" => $students
]);

$conn->close();
?>
