<?php 
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "PHPMailer/src/Exception.php";
require "PHPMailer/src/PHPMailer.php";
require "PHPMailer/src/SMTP.php";

define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "tracked");

define("SMTP_HOST", "smtp.gmail.com");
define("SMTP_PORT", 587);
define("SMTP_USER", "xyrilljohnabreu25@gmail.com");
define("SMTP_PASS", "qovk myly ukpz rljq");
define("FROM_EMAIL", "noreply@tracked.com");
define("FROM_NAME", "TrackED System");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["email"]) || !isset($input["idNumber"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and ID Number are required"]);
    exit();
}

$email = filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL);
$idNumber = trim($input["idNumber"]);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

if (!preg_match('/^\d{9}$/', $idNumber)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid ID number format"]);
    exit();
}

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed");
    }

    $stmt = $conn->prepare("SELECT tracked_ID, tracked_firstname, tracked_lastname, tracked_email FROM tracked_users WHERE tracked_email = ? AND tracked_ID = ?");
    $stmt->bind_param("ss", $email, $idNumber);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No account found with this email and ID number']);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $userId = $user["tracked_ID"];
    $userName = $user["tracked_firstname"] . ' ' . $user["tracked_lastnameme"];

    $token = bin2hex(random_bytes(32));
    $expiry = date("Y-m-d H:i:s", strtotime("+24 hours"));

    $stmt = $conn->prepare("INSERT INTO password_resets (tracked_ID, token, expiry) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expiry = ?");
    $stmt->bind_param("sssss", $userId, $token, $expiry, $token, $expiry);
    $stmt->execute();

    $stmt->close();
    $conn->close();

    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        $mail->setFrom(FROM_EMAIL, FROM_NAME);
        $mail->addAddress($email, $userName);

        $mail->isHTML(true);
        $mail->Subject = "Password Reset Request - TrackED";
        
        // for development
        $resetLink = "http://localhost:5173/ForgotPass?token=" . $token;
        // for production
        // $resetLink = "https://ywwebsitenatin.com/ForgotPass?token=" . $token;

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
        
        $mail->send();
        
        echo json_encode([
            'success' => true,
            'message' => 'Password reset link has been sent to your email'
        ]);        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to send email: " . $mail->ErrorInfo
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later."
    ]);
}
?>