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
$fields = ['patient_id', 'staff_id', 'disease_name', 'disease_status'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Check for required fields
if (!$data['patient_id'] || !$data['staff_id']) {
    echo json_encode(["error" => "Missing required patient_id or staff_id."]);
    exit;
}

// Insert into disease table
$sql = "INSERT INTO disease (
    patient_id, disease_name, disease_status, date_recorded, last_updated, is_deleted
) VALUES (
    '{$data['patient_id']}', '{$data['disease_name']}', '{$data['disease_status']}', NOW(), NOW(), 'false'
)";

if ($conn->query($sql)) {
    // Audit trail
    $description = "Added disease record for patient ID {$data['patient_id']} - "
        . "Disease: {$data['disease_name']}, Status: {$data['disease_status']}.";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'disease', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Disease record added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
