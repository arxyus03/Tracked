<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Include PHPMailer - FIXED PATHS
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Use correct relative paths
require __DIR__ . "/../PHPMailer/src/Exception.php";
require __DIR__ . "/../PHPMailer/src/PHPMailer.php";
require __DIR__ . "/../PHPMailer/src/SMTP.php";

// SMTP Configuration
define("SMTP_HOST", "smtp.gmail.com");
define("SMTP_PORT", 587);
define("SMTP_USER", "tracked.0725@gmail.com");
define("SMTP_PASS", "nmvi itzx dqrh qimh");
define("FROM_EMAIL", "tracked.0725@gmail.com");
define("FROM_NAME", "TrackED System");

// Fetch all users from the users table
$sql = "SELECT * FROM users";
$result = $conn->query($sql);

$successCount = 0;
$errorCount = 0;
$errorMessages = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $user_ID = $conn->real_escape_string($row['user_ID']);
        $user_firstname = $conn->real_escape_string($row['user_firstname']);
        $user_middlename = $conn->real_escape_string($row['user_middlename']);
        $user_lastname = $conn->real_escape_string($row['user_lastname']);
        $user_Email = $conn->real_escape_string($row['user_Email']);
        $user_phonenumber = $conn->real_escape_string($row['user_phonenumber']);
        $user_bday = $conn->real_escape_string($row['user_bday']);
        $user_Gender = $conn->real_escape_string($row['user_Gender']);
        $user_Role = $conn->real_escape_string($row['user_Role']);
        $user_yearandsection = $conn->real_escape_string($row['user_yearandsection']);
        $user_program = $conn->real_escape_string($row['user_program']);
        $user_semester = $conn->real_escape_string($row['user_semester']);

        // Generate random password based on bday, role, and ID
        $bday = str_replace("/", "", $user_bday);
        $random = substr(str_shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, 3);
        $plain_password = $bday . $user_Role . $user_ID . $random;
        $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

        // Check if the user already exists in tracked_users
        $check_sql = "SELECT tracked_ID FROM tracked_users WHERE tracked_ID = '$user_ID'";
        $check_result = $conn->query($check_sql);

        // Handle the birthday date properly
        $formatted_bday = "NULL";
        if (!empty($user_bday)) {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $user_bday)) {
                $formatted_bday = "'$user_bday'";
            } else if (preg_match('/^\d{1,2}\/\d{1,2}\/\d{4}$/', $user_bday)) {
                $formatted_bday = "STR_TO_DATE('$user_bday', '%m/%d/%Y')";
            } else {
                $timestamp = strtotime($user_bday);
                if ($timestamp !== false) {
                    $mysql_date = date('Y-m-d', $timestamp);
                    $formatted_bday = "'$mysql_date'";
                }
            }
        }

        if ($check_result && $check_result->num_rows == 0) {
            // Insert new record
            $insert_sql = "INSERT INTO tracked_users (
                tracked_ID, tracked_Role, tracked_email, tracked_password,
                tracked_firstname, tracked_lastname, tracked_middlename,
                tracked_program, tracked_yearandsec, tracked_semester, tracked_bday,
                tracked_gender, tracked_phone, tracked_Status, temporary_password
            ) VALUES (
                '$user_ID', '$user_Role', '$user_Email', '$hashed_password',
                '$user_firstname', '$user_lastname', '$user_middlename',
                '$user_program', '$user_yearandsection', '$user_semester',
                $formatted_bday,
                '$user_Gender', '$user_phonenumber', 'Active', '$plain_password'
            )";

            if ($conn->query($insert_sql)) {
                // Send email with temporary password
                $emailSent = sendTemporaryPasswordEmail($user_Email, $user_firstname, $user_ID, $plain_password);
                if ($emailSent) {
                    $successCount++;
                } else {
                    $errorCount++;
                    $errorMessages[] = "Failed to send email to $user_Email";
                }
            } else {
                $errorCount++;
                $errorMessages[] = "Failed to insert user $user_ID: " . $conn->error;
            }
        } else if ($check_result) {
            // Update existing record
            $update_sql = "UPDATE tracked_users SET
                tracked_Role = '$user_Role',
                tracked_email = '$user_Email',
                tracked_password = '$hashed_password',
                tracked_firstname = '$user_firstname',
                tracked_lastname = '$user_lastname',
                tracked_middlename = '$user_middlename',
                tracked_program = '$user_program',
                tracked_yearandsec = '$user_yearandsection',
                tracked_semester = '$user_semester',
                tracked_bday = $formatted_bday,
                tracked_gender = '$user_Gender',
                tracked_phone = '$user_phonenumber',
                tracked_Status = 'Active',
                temporary_password = '$plain_password'
            WHERE tracked_ID = '$user_ID'";

            if ($conn->query($update_sql)) {
                // Send email with temporary password
                $emailSent = sendTemporaryPasswordEmail($user_Email, $user_firstname, $user_ID, $plain_password);
                if ($emailSent) {
                    $successCount++;
                } else {
                    $errorCount++;
                    $errorMessages[] = "Failed to send email to $user_Email";
                }
            } else {
                $errorCount++;
                $errorMessages[] = "Failed to update user $user_ID: " . $conn->error;
            }
        }
    }

    $message = "Accounts activated successfully. ";
    $message .= "Emails sent to $successCount users. ";
    if ($errorCount > 0) {
        $message .= "$errorCount emails failed to send. ";
        $message .= "Errors: " . implode(", ", array_slice($errorMessages, 0, 5));
    }

    echo json_encode(["status" => "success", "message" => $message]);
} else {
    echo json_encode(["status" => "error", "message" => "No users found in source table."]);
}

$conn->close();

function sendTemporaryPasswordEmail($user_Email, $user_firstname, $user_ID, $plain_password) {
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
        $mail->addAddress($user_Email, $user_firstname);
        $mail->addReplyTo(FROM_EMAIL, FROM_NAME);

        // Email content
        $mail->isHTML(true);
        $mail->Subject = "Your TrackED Account Has Been Activated";

        $mail->Body = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #00A15D; text-align: center; margin-bottom: 20px;">Welcome to TrackED!</h2>
                
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear ' . htmlspecialchars($user_firstname) . ',</p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Your TrackED account has been successfully activated. Below are your login credentials:
                </p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 10px 0;"><strong>User ID:</strong> ' . htmlspecialchars($user_ID) . '</p>
                    <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #eee; padding: 5px 10px; border-radius: 3px; font-size: 16px;">' . htmlspecialchars($plain_password) . '</code></p>
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>Important:</strong> For security reasons, please change your password after your first login. 
                        You can use the "Forgot Password" feature if needed, using this temporary password as your current password.
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                    You can now access your account at: <a href="https://tracked.6minds.site/Login"> https://tracked.6minds.site/Login </a>
                </p>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    This is a system generated message. Please do not reply.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <p style="color: #999; font-size: 12px; line-height: 1.5;">
                    If you are not the intended recipient of this message, please destroy it immediately.
                </p>
            </div>
        </div>';

        $mail->AltBody = "Welcome to TrackED!\n\nDear " . $user_firstname . ",\n\nYour TrackED account has been successfully activated.\n\nLogin Credentials:\nUser ID: " . $user_ID . "\nTemporary Password: " . $plain_password . "\n\nImportant: For security reasons, please change your password after your first login. You can use the 'Forgot Password' feature if needed, using this temporary password as your current password.\n\nLogin URL: https://tracked.6minds.site/Login\n\nThis is a system generated message. Please do not reply.";

        return $mail->send();
    } catch (Exception $e) {
        error_log("Email sending failed for $user_Email: " . $e->getMessage());
        return false;
    }
}
?>