<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php");

// Sanitize inputs
$fields = [
    'referral_id', 'patient_id', 'description', 'referral_date', 'approval_status', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Build the UPDATE query
$sql = "UPDATE referrals SET 
    description = '{$data['description']}',
    referral_date = '{$data['referral_date']}',
    approval_status = '{$data['approval_status']}',
    last_updated = NOW()
";

$sql .= " WHERE referral_id = '{$data['referral_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Updated referral record: Description: {$data['description']}, Date: {$data['referral_date']}, Status: {$data['approval_status']}";
    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'referral', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for success

    echo json_encode(["message" => "Referral record updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
