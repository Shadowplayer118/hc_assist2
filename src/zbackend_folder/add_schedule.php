<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php");

// Sanitize and extract POST inputs
$fields = ['patient_id', 'staff_id', 'sched_type', 'status', 'sched_date', 'activity'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Check for required fields
if (!$data['patient_id'] || !$data['staff_id'] || !$data['sched_type'] || !$data['status'] || !$data['sched_date']) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

// Insert into schedule table
$sql = "INSERT INTO schedules (
    patient_id, sched_type, status, sched_date, activity, date_created
) VALUES (
    '{$data['patient_id']}', '{$data['sched_type']}', '{$data['status']}', '{$data['sched_date']}', '{$data['activity']}', NOW()
)";

if ($conn->query($sql)) {
    // Audit trail
    $description = "Added schedule record for patient ID {$data['patient_id']} - "
        . "Schedule Type: {$data['sched_type']}, Status: {$data['status']}, Date: {$data['sched_date']}.";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'schedule', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Schedule record added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
