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
    'medical_id', 'patient_id', 'weight', 'height', 'blood_pressure',
    'heart_rate', 'temperature', 'date_recorded', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Build the UPDATE query
$sql = "UPDATE medical_record SET 
    weight = '{$data['weight']}',
    height = '{$data['height']}',
    blood_pressure = '{$data['blood_pressure']}',
    heart_rate = '{$data['heart_rate']}',
    temperature = '{$data['temperature']}',
    date_recorded = '{$data['date_recorded']}'

";

// If the query fails, output an error
$sql .= " WHERE medical_id = '{$data['medical_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $fullName = "Medical record for Patient ID: {$data['patient_id']}";
    $description = "Updated medical record: weight: {$data['weight']}, height: {$data['height']}, blood_pressure: {$data['blood_pressure']}, heart_rate: {$data['heart_rate']}, temperature: {$data['temperature']}, date_recorded: {$data['date_recorded']}.";

    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'medical_records', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check success here too

    echo json_encode(["message" => "Medical record updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
