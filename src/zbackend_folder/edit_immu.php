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
    'immu_id', 'patient_id', 'immu_name', 'date_administered', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Validate required fields
if (!$data['immu_id'] || !$data['patient_id']) {
    echo json_encode(["error" => "Missing required immunization ID or patient ID."]);
    exit;
}

// Build the UPDATE query
$sql = "UPDATE immu SET 
    immu_name = '{$data['immu_name']}',
    date_administered = '{$data['date_administered']}',
    last_updated = NOW()
WHERE immu_id = '{$data['immu_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // Insert into audit trail
    $description = "Updated immunization record: Name: {$data['immu_name']}, Date: {$data['date_administered']}";
    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'immunization', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: handle audit errors

    echo json_encode(["message" => "Immunization record updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
