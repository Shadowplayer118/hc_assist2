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
$fields = ['patient_id', 'staff_id', 'weight', 'height', 'blood_pressure', 'heart_rate', 'temperature'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Check for required fields
if (!$data['patient_id'] || !$data['staff_id']) {
    echo json_encode(["error" => "Missing required patient_id or staff_id."]);
    exit;
}

// Insert into medical_records table
$sql = "INSERT INTO medical_record (
    patient_id, weight, height, blood_pressure, heart_rate, temperature, date_recorded, last_updated, is_deleted
) VALUES (
    '{$data['patient_id']}', '{$data['weight']}', '{$data['height']}',
    '{$data['blood_pressure']}', '{$data['heart_rate']}', '{$data['temperature']}', NOW(), NOW(), 'false'
)";

if ($conn->query($sql)) {
    // Audit trail
    $description = "Added medical record for patient ID {$data['patient_id']} - "
        . "Weight: {$data['weight']}, Height: {$data['height']}, "
        . "BP: {$data['blood_pressure']}, HR: {$data['heart_rate']}, Temp: {$data['temperature']}.";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'medical_records', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Medical record added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
