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
    'disease_id', 'patient_id', 'disease_name', 'disease_status', 'date_recorded', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Build the UPDATE query
$sql = "UPDATE disease SET 
    disease_name = '{$data['disease_name']}',
    disease_status = '{$data['disease_status']}',
    last_updated = NOW()
";

$sql .= " WHERE disease_id = '{$data['disease_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Updated disease record: Name: {$data['disease_name']}, Status: {$data['disease_status']}, Date: {$data['date_recorded']}";
    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'disease_record', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check success here too

    echo json_encode(["message" => "Disease record updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
