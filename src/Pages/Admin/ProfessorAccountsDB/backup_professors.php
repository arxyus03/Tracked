<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "u713320770_trackedDB";
$password = "Tracked@2025";
$dbname = "u713320770_tracked";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get only professor accounts
    $stmt = $conn->prepare("SELECT * FROM tracked_users WHERE tracked_Role = 'Professor'");
    $stmt->execute();
    $professors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Generate SQL file content
    $sqlContent = "-- TrackEd Professors Backup\n";
    $sqlContent .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
    
    foreach ($professors as $professor) {
        $values = [];
        foreach ($professor as $key => $value) {
            if ($value === null) {
                $values[] = "NULL";
            } else {
                $values[] = $conn->quote($value);
            }
        }
        
        $sqlContent .= "INSERT INTO tracked_users (" . implode(', ', array_keys($professor)) . ") ";
        $sqlContent .= "VALUES (" . implode(', ', $values) . ") ";
        $sqlContent .= "ON DUPLICATE KEY UPDATE ";
        
        $updates = [];
        foreach ($professor as $key => $value) {
            if ($key !== 'tracked_ID') {
                $updates[] = "$key = " . ($value === null ? "NULL" : $conn->quote($value));
            }
        }
        $sqlContent .= implode(', ', $updates) . ";\n";
    }

    // Save to backup folder
    $backupDir = __DIR__ . '/../../Backup/professors/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0777, true);
    }
    
    $filename = 'professors_backup_' . date('Y-m-d_H-i-s') . '.sql';
    $filepath = $backupDir . $filename;
    
    if (file_put_contents($filepath, $sqlContent)) {
        echo json_encode([
            'success' => true,
            'message' => 'Backup created successfully',
            'filename' => $filename,
            'filepath' => $filepath
        ]);
    } else {
        throw new Exception('Failed to write backup file');
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>