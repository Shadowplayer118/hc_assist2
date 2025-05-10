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

// Extract fields
$fields = ['patient_id', 'staff_id', 'start_date', 'due_date', 'status', 'father', 'father_contact', 'second_trimester', 'third_trimester'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($input[$field]) ? $conn->real_escape_string($input[$field]) : '';
}

// Validate required fields
if (!$data['patient_id'] || !$data['staff_id']) {
    echo json_encode(["error" => "Missing required patient_id or staff_id."]);
    exit;
}

// Insert into pregnant table
$sql = "INSERT INTO pregnant (
    patient_id, start_date, due_date, status, father, father_contact, date_recorded, last_updated, is_deleted
) VALUES (
    '{$data['patient_id']}', '{$data['start_date']}', '{$data['due_date']}', '{$data['status']}',
    '{$data['father']}', '{$data['father_contact']}', NOW(), NOW(), 'false'
)";

if ($conn->query($sql)) {
    // Insert into schedules table for due date, 2nd trimester, and 3rd trimester
    $scheduleInserts = [];

    if (!empty($data['due_date'])) {
        $scheduleInserts[] = "(
            '{$data['patient_id']}', 'pregnant', 'pending', '{$data['due_date']}', 'Pregnancy Due Date', NOW()
        )";
    }

    if (!empty($data['second_trimester'])) {
        $scheduleInserts[] = "(
            '{$data['patient_id']}', 'pregnant', 'pending', '{$data['second_trimester']}', '2nd Trimester', NOW()
        )";
    }

    if (!empty($data['third_trimester'])) {
        $scheduleInserts[] = "(
            '{$data['patient_id']}', 'pregnant', 'pending', '{$data['third_trimester']}', '3rd Trimester', NOW()
        )";
    }

    if (!empty($scheduleInserts)) {
        $schedSql = "INSERT INTO schedules (
            patient_id, sched_type, status, sched_date, activity, date_created
        ) VALUES " . implode(",", $scheduleInserts);

        $conn->query($schedSql); // Optional: check for insert success
    }

    // Audit trail
    $description = "Added pregnancy record for patient ID {$data['patient_id']} - "
        . "Start Date: {$data['start_date']}, Due Date: {$data['due_date']}, Status: {$data['status']}.";

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Insert', '$description', 'pregnant', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional: check for audit insert errors

    echo json_encode(["message" => "Pregnancy record and schedules added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
