<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['patient_id'], $data['staff_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$patient_id = $conn->real_escape_string($data['patient_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);

// Get patient full name for audit
$patientQuery = $conn->query("SELECT first_name, mid_name, last_name FROM patient WHERE patient_id = '$patient_id'");
if (!$patientQuery || $patientQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Patient not found."]);
    exit;
}
$patient = $patientQuery->fetch_assoc();
$fullName = $patient['first_name'] . ' ' . $patient['mid_name'] . ' ' . $patient['last_name'];

// Soft delete
$deleteSql = "UPDATE patient SET is_deleted = 'true', last_updated = NOW() WHERE patient_id = '$patient_id'";
if ($conn->query($deleteSql)) {
    // Record audit trail
    $description = "Soft deleted patient $fullName (ID: $patient_id)";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$description', 'patient', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Patient soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete patient: " . $conn->error]);
}

$conn->close();
?>
