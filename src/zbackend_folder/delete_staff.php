<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['staff_id'], $data['admin_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$staff_id = $conn->real_escape_string($data['staff_id']);
$admin_id = $conn->real_escape_string($data['admin_id']);

// Get staff full name for audit
$staffQuery = $conn->query("SELECT first_name, mid_name, last_name FROM staff WHERE staff_id = '$staff_id'");
if (!$staffQuery || $staffQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Staff not found."]);
    exit;
}
$staff = $staffQuery->fetch_assoc();
$fullName = $staff['first_name'] . ' ' . $staff['mid_name'] . ' ' . $staff['last_name'];

// Soft delete
$deleteSql = "UPDATE staff SET is_deleted = 'true', last_updated = NOW() WHERE staff_id = '$staff_id'";
if ($conn->query($deleteSql)) {
    // Record audit trail
    $description = "Soft deleted staff $fullName (ID: $staff_id)";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$admin_id', 'Delete', '$description', 'staff', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Staff soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete staff: " . $conn->error]);
}

$conn->close();
?>
