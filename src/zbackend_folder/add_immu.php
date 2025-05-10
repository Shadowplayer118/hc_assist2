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
$fields = ['patient_id', 'staff_id', 'immu_name', 'date_administered'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Check for required fields
if (!$data['patient_id'] || !$data['staff_id']) {
    echo json_encode(["error" => "Missing required patient_id or staff_id."]);
    exit;
}

// Insert into immunization table
$sql = "INSERT INTO immu (
    patient_id, immu_name, date_administered, is_deleted, last_updated, date_recorded
) VALUES (
    '{$data['patient_id']}', '{$data['immu_name']}', '{$data['date_administered']}', 'false', NOW(), NOW()
)";

if ($conn->query($sql)) {
    // Audit trail
    $description = "Added immunization record for patient ID {$data['patient_id']} - "
        . "Immunization: {$data['immu_name']}, Date: {$data['date_administered']}.";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'immunization', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Immunization record added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
