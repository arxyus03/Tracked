<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "tracked";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get POST data
$user_ID     = $_POST['tracked_ID'] ?? '';
$user_email  = $_POST['tracked_email'] ?? '';
$user_pass   = $_POST['tracked_password'] ?? '';
$user_fname  = $_POST['tracked_fname'] ?? '';
$user_lname  = $_POST['tracked_lname'] ?? '';
$user_mi     = $_POST['tracked_mi'] ?? '';
$user_prog   = $_POST['tracked_program'] ?? '';
$user_bday   = $_POST['tracked_bday'] ?? '';
$user_phone  = $_POST['tracked_phone'] ?? '';

// Validate required fields
if (empty($user_ID) || empty($user_email) || empty($user_pass) || empty($user_fname) || empty($user_lname)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Hash the password PROPERLY
$hashed_pass = password_hash($user_pass, PASSWORD_DEFAULT);

// DEBUG: Log the password hashing
error_log("=== SIGNUP ATTEMPT ===");
error_log("User ID: " . $user_ID);
error_log("Plain password: " . $user_pass);
error_log("Hashed password: " . $hashed_pass);

// Step 1: Check if user exists in whitelist (users table)
$check = $conn->prepare("SELECT user_ID, user_Role, user_Gender FROM users WHERE user_ID = ?");
if (!$check) {
    echo json_encode(["success" => false, "message" => "Database error"]);
    $conn->close();
    exit;
}

$check->bind_param("s", $user_ID);
$check->execute();
$result = $check->get_result();

if ($row = $result->fetch_assoc()) {
    $role   = $row['user_Role'] ?? 'Student';
    $gender = $row['user_Gender'] ?? '';
    
    // Step 2: Check if user already registered in tracked_users
    $check_tracked = $conn->prepare("SELECT tracked_ID FROM tracked_users WHERE tracked_ID = ?");
    if (!$check_tracked) {
        echo json_encode(["success" => false, "message" => "Database error"]);
        $check->close();
        $conn->close();
        exit;
    }
    
    $check_tracked->bind_param("s", $user_ID);
    $check_tracked->execute();
    $tracked_result = $check_tracked->get_result();
    
    if ($tracked_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "User already registered in TrackED system!"]);
        $check_tracked->close();
        $check->close();
        $conn->close();
        exit;
    }
    $check_tracked->close();

    // Step 3: Insert into tracked_users
    $insert = $conn->prepare("INSERT INTO tracked_users 
        (tracked_ID, tracked_Role, tracked_email, tracked_password, tracked_fname, tracked_lname, tracked_mi, tracked_program, tracked_bday, tracked_gender, tracked_phone, tracked_Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')");
    
    if (!$insert) {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
        $check->close();
        $conn->close();
        exit;
    }

    $insert->bind_param(
        "sssssssssss",
        $user_ID,
        $role,
        $user_email,
        $hashed_pass,  // This should be the PROPERLY hashed password
        $user_fname,
        $user_lname,
        $user_mi,
        $user_prog,
        $user_bday,
        $gender,
        $user_phone
    );

    if ($insert->execute()) {
        // Verify the stored data
        $verify = $conn->prepare("SELECT tracked_password FROM tracked_users WHERE tracked_ID = ?");
        $verify->bind_param("s", $user_ID);
        $verify->execute();
        $verify->bind_result($stored_hash);
        $verify->fetch();
        $verify->close();
        
        error_log("Stored hash in DB: " . $stored_hash);
        error_log("Password verify test: " . (password_verify($user_pass, $stored_hash) ? "SUCCESS" : "FAILED"));
        
        echo json_encode(["success" => true, "message" => "Signup successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed: " . $insert->error]);
    }
    
    $insert->close();
} else {
    echo json_encode(["success" => false, "message" => "Your account is not authorized to sign up. Please contact administrator."]);
}

$check->close();
$conn->close();
?>