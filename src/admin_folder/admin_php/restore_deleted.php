<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['record_id'], $data['staff_id'], $data['target_table'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$record_id = $conn->real_escape_string($data['record_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);
$table = $conn->real_escape_string($data['target_table']);

// Try to fetch full name if available
$nameQuery = $conn->query("SELECT first_name, mid_name, last_name FROM `$table` WHERE {$table}_id = '$record_id'");
$recordName = "Record";
if ($nameQuery && $nameQuery->num_rows > 0) {
    $row = $nameQuery->fetch_assoc();
    $recordName = trim($row['first_name'] . ' ' . $row['mid_name'] . ' ' . $row['last_name']);
}

// Update record to restore
$restoreSql = "UPDATE `$table` SET is_deleted = 'false', last_updated = NOW() WHERE {$table}_id = '$record_id'";
if ($conn->query($restoreSql)) {
    $description = "Restored $recordName (ID: $record_id) in $table";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Restore', '$description', '$table', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "$table record restored."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to restore: " . $conn->error]);
}

$conn->close();
?>
