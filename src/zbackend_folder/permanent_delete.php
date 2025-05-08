<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['record_id'], $data['staff_id'], $data['target_table'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$record_id = $conn->real_escape_string($data['record_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);
$table = $conn->real_escape_string($data['target_table']);

// Try to get name for audit log
$nameQuery = $conn->query("SELECT first_name, mid_name, last_name FROM `$table` WHERE {$table}_id = '$record_id'");
$recordName = "Record";
if ($nameQuery && $nameQuery->num_rows > 0) {
    $row = $nameQuery->fetch_assoc();
    $recordName = trim($row['first_name'] . ' ' . $row['mid_name'] . ' ' . $row['last_name']);
}

// Delete the record
$deleteSql = "DELETE FROM `$table` WHERE {$table}_id = '$record_id'";
if ($conn->query($deleteSql)) {
    // Log audit trail
    $description = "Permanently deleted $recordName (ID: $record_id) from $table";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Permanent Delete', '$description', '$table', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "$table record permanently deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Delete failed: " . $conn->error]);
}

$conn->close();
?>
