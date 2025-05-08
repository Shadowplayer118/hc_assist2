<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['meds_id'], $data['staff_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$meds_id = $conn->real_escape_string($data['meds_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);

// Get medicine item name for audit
$medQuery = $conn->query("SELECT item_name FROM meds WHERE meds_id = '$meds_id'");
if (!$medQuery || $medQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Medicine not found."]);
    exit;
}
$med = $medQuery->fetch_assoc();
$itemName = $med['item_name'];

// Soft delete
$deleteSql = "UPDATE meds SET is_deleted = 'true', last_updated = NOW() WHERE meds_id = '$meds_id'";
if ($conn->query($deleteSql)) {
    // Record audit trail
    $description = "Soft deleted medicine $itemName (ID: $meds_id)";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$description', 'medicines', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Medicine soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete medicine: " . $conn->error]);
}

$conn->close();
?>
