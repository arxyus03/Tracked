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

    // Get the latest backup file for professors
    $backupDir = __DIR__ . '/../../Backup/professors/';
    $files = glob($backupDir . 'professors_backup_*.sql');
    
    if (empty($files)) {
        throw new Exception('No backup files found for professors');
    }
    
    // Get the most recent file
    $latestFile = max($files);
    $sqlContent = file_get_contents($latestFile);
    
    if (!$sqlContent) {
        throw new Exception('Failed to read backup file');
    }

    // Execute the SQL statements
    $conn->exec($sqlContent);
    
    echo json_encode([
        'success' => true,
        'message' => 'Professors restored successfully',
        'filename' => basename($latestFile)
    ]);

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