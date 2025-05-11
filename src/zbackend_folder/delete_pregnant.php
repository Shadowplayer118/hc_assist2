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

$pregnant_id = $conn->real_escape_string($data['record_id']);
$staff_id = $conn->real_escape_string($data['staff_id']);

// Get associated patient full name
$joinQuery = $conn->query("
    SELECT p.first_name, p.mid_name, p.last_name, pr.patient_id
    FROM pregnant pr
    JOIN patient p ON pr.patient_id = p.patient_id
    WHERE pr.pregnant_id = '$pregnant_id'
");

if (!$joinQuery || $joinQuery->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Pregnancy record or patient not found."]);
    exit;
}

$row = $joinQuery->fetch_assoc();
$fullName = "{$row['first_name']} {$row['mid_name']} {$row['last_name']}";

// Soft delete the pregnancy record
$deleteSql = "UPDATE pregnant SET is_deleted = 'true', last_updated = NOW() WHERE pregnant_id = '$pregnant_id'";
if ($conn->query($deleteSql)) {
    // ✅ Update status of associated schedules to 'Cancelled'
    $updateSchedules = "UPDATE schedules SET status = 'cancelled' WHERE pregnant_id = '$pregnant_id'";
    $conn->query($updateSchedules);

    // Log audit trail
    $description = "Soft deleted pregnancy record (ID: $pregnant_id) for patient $fullName";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$description', 'pregnant', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    echo json_encode(["success" => true, "message" => "Pregnancy record and associated schedules soft deleted."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete pregnancy record: " . $conn->error]);
}

$conn->close();
?>
