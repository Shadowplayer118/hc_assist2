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
$fields = ['patient_id', 'staff_id', 'description', 'referral_date', 'approval_status'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Check for required fields
if (!$data['patient_id'] || !$data['staff_id']) {
    echo json_encode(["error" => "Missing required patient_id or staff_id."]);
    exit;
}

// Insert into referral table
$sql = "INSERT INTO referrals (
    patient_id, description, referral_date, approval_status, date_created, is_deleted, last_updated
) VALUES (
    '{$data['patient_id']}', '{$data['description']}', 
    '{$data['referral_date']}', '{$data['approval_status']}', NOW(), 'false', NOW()
)";

if ($conn->query($sql)) {
    // Audit trail
    $description = "Added referral for patient ID {$data['patient_id']} - Description: {$data['description']}, Status: {$data['approval_status']}.";
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'referral', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Referral record added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
