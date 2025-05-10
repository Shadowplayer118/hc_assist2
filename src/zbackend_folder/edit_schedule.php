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
    'sched_id', 'patient_id', 'sched_type', 'status', 'sched_date', 'activity', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Check if the status is passed (for the "Resolve" action)
if (isset($data['status']) && $data['status'] === 'done') {
    // If the status is being set to "done", we will update it explicitly.
    $statusUpdate = ", status = 'done'"; // Ensure the status is updated to 'done'
} else {
    $statusUpdate = ''; // No status update if it's not "done"
}

// Build the UPDATE query
$sql = "UPDATE schedules SET 
    sched_type = '{$data['sched_type']}',
    sched_date = '{$data['sched_date']}',
    activity = '{$data['activity']}' 
    $statusUpdate
    WHERE sched_id = '{$data['sched_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Updated schedule record: Type: {$data['sched_type']}, Status: {$data['status']}, Date: {$data['sched_date']}, Activity: {$data['activity']}";
    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'schedule', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check success here too

    echo json_encode(["message" => "Schedule record updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
