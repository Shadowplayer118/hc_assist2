<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['record_id'], $data['staff_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$record_id = $conn->real_escape_string($data['record_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);

// Get associated patient full name
$joinQuery = $conn->query("
    SELECT p.first_name, p.mid_name, p.last_name, dr.patient_id
    FROM disease dr
    JOIN patient p ON dr.patient_id = p.patient_id
    WHERE dr.disease_id = '$record_id'
");

if (!$joinQuery || $joinQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Disease record or patient not found."]);
    exit;
}

$row = $joinQuery->fetch_assoc();
$fullName = "{$row['first_name']} {$row['mid_name']} {$row['last_name']}";

// Soft delete the disease record
$deleteSql = "UPDATE disease SET is_deleted = 'true', last_updated = NOW() WHERE disease_id = '$record_id'";
if ($conn->query($deleteSql)) {
    // Log audit trail
    $description = "Soft deleted disease record (ID: $record_id) for patient $fullName";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$description', 'disease_record', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Disease record soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete disease record: " . $conn->error]);
}

$conn->close();
?>
