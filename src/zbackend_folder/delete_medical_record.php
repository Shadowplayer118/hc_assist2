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
    SELECT p.first_name, p.mid_name, p.last_name, mr.patient_id
    FROM medical_record mr
    JOIN patient p ON mr.patient_id = p.patient_id
    WHERE mr.medical_id = '$record_id'
");

if (!$joinQuery || $joinQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Medical record or patient not found."]);
    exit;
}

$row = $joinQuery->fetch_assoc();
$fullName = "{$row['first_name']} {$row['mid_name']} {$row['last_name']}";

// Soft delete the medical record
$deleteSql = "UPDATE medical_record SET is_deleted = 'true', last_updated = NOW() WHERE medical_id = '$record_id'";
if ($conn->query($deleteSql)) {
    // Log audit trail
    $description = "Soft deleted medical record (ID: $record_id) for patient $fullName";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$description', 'medical_record', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Medical record soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete medical record: " . $conn->error]);
}

$conn->close();
?>
