<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set("display_errors", 1);

// Clear any output buffers to prevent unwanted output
while (ob_get_level()) {
    ob_end_clean();
}

// Set headers FIRST to prevent any output issues
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// FIXED: Use absolute paths for PHPMailer
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

// Database connection settings
$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

// SMTP Configuration
define("SMTP_HOST", "smtp.gmail.com");
define("SMTP_PORT", 587);
define("SMTP_USER", "tracked.0725@gmail.com");
define("SMTP_PASS", "nmvi itzx dqrh qimh");
define("FROM_EMAIL", "tracked.0725@gmail.com");
define("FROM_NAME", "TrackED System");

// Create DB connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}
$conn->set_charset('utf8mb4');

// Read JSON input
$raw = file_get_contents("php://input");
if (empty($raw)) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data: " . json_last_error_msg()]);
    exit;
}

if (!isset($input["email"]) || !isset($input["idNumber"])) {
    echo json_encode(["success" => false, "message" => "Email and ID Number are required"]);
    exit();
}

$email = filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL);
$idNumber = trim($input["idNumber"]);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

if (!preg_match('/^\d{9}$/', $idNumber)) {
    echo json_encode(["success" => false, "message" => "Invalid ID number format. Must be 9 digits."]);
    exit();
}

try {
    // Check if user exists
    $stmt = $conn->prepare("SELECT tracked_ID, tracked_firstname, tracked_lastname, tracked_email FROM tracked_users WHERE tracked_email = ? AND tracked_ID = ?");
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }
    
    $stmt->bind_param("ss", $email, $idNumber);
    
    if (!$stmt->execute()) {
        throw new Exception("Database query failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'No account found with this email and ID number']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $userId = $user["tracked_ID"];
    $userName = $user["tracked_firstname"] . ' ' . $user["tracked_lastname"];
    $stmt->close();

    // Generate token and expiry
    $token = bin2hex(random_bytes(32));
    $expiry = date("Y-m-d H:i:s", strtotime("+24 hours"));

    // Check if user already has a reset token and update it
    $stmt = $conn->prepare("SELECT id FROM password_resets WHERE tracked_ID = ?");
    if (!$stmt) {
        throw new Exception("Database error: " . $conn->error);
    }
    
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing token
        $stmt->close();
        $stmt = $conn->prepare("UPDATE password_resets SET token = ?, expiry = ?, used = 0 WHERE tracked_ID = ?");
        if (!$stmt) {
            throw new Exception("Database error: " . $conn->error);
        }
        $stmt->bind_param("sss", $token, $expiry, $userId);
    } else {
        // Insert new token
        $stmt->close();
        $stmt = $conn->prepare("INSERT INTO password_resets (tracked_ID, token, expiry, used) VALUES (?, ?, ?, 0)");
        if (!$stmt) {
            throw new Exception("Database error: " . $conn->error);
        }
        $stmt->bind_param("sss", $userId, $token, $expiry);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to generate reset token: " . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();

    // Send password reset email
    $emailSent = sendPasswordResetEmail($email, $userName, $token);
    
    if ($emailSent) {
        echo json_encode([
            'success' => true,
            'message' => 'Password reset link has been sent to your email'
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to send email. Please try again later."
        ]);
    }
        
} catch (Exception $e) {
    error_log("VerifyAcc Error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later."
    ]);
}

exit;

function sendPasswordResetEmail($user_Email, $user_name, $token) {
    try {
        $mail = new PHPMailer(true);

        // SMTP configuration
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        // Debugging (optional - remove in production)
        $mail->SMTPDebug = 0;
        $mail->Debugoutput = 'error_log';

        // Sender and recipient
        $mail->setFrom(FROM_EMAIL, FROM_NAME);
        $mail->addAddress($user_Email, $user_name);
        $mail->addReplyTo(FROM_EMAIL, FROM_NAME);

        // Email content
        $mail->isHTML(true);
        $mail->Subject = "Password Reset Request - TrackED";
        
        // Use production link for host
        $resetLink = "https://tracked.6minds.site/ForgotPass?token=" . $token;

        $mail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hi there!</p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    We have received a request to change your password. Please click the button below to continue:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="' . $resetLink . '" style="display: inline-block; background-color: #00A15D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Change Password</a>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                    This request is only valid for 24 hours. If you did not request a new password, somebody is trying to access your account.
                </p>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    This is a system generated message. Please do not reply.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; line-height: 1.5;">
                    If you are not the addressee of this message, you may not copy, disclose, distribute, or disseminate this message (and any attachment hereto) to anyone. Instead, destroy this message (and any attachment hereto).
                </p>
            </div>
        </div>';
        
        $mail->AltBody = "Hi there!\n\nWe have received a request to change your password. Please visit the following link to reset your password:\n\n" . $resetLink . "\n\nThis request is only valid for 24 hours. If you did not request a new password, somebody is trying to access your account.\n\nThis is a system generated message. Please do not reply.";
        
        return $mail->send();
    } catch (Exception $e) {
        error_log("Email sending failed for $user_Email: " . $e->getMessage());
        return false;
    }
}
?>