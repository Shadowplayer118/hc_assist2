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
    'pregnant_id', 'patient_id', 'start_date', 'due_date', 'status',
    'father', 'father_contact', 'staff_id', 'second_trimester_date', 'third_trimester_date'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Build the UPDATE query for pregnant table
$sql = "UPDATE pregnant SET 
    start_date = '{$data['start_date']}',
    due_date = '{$data['due_date']}',
    status = '{$data['status']}',
    father = '{$data['father']}',
    father_contact = '{$data['father_contact']}',
    last_updated = NOW()
    WHERE pregnant_id = '{$data['pregnant_id']}' AND patient_id = '{$data['patient_id']}'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Updated pregnancy record: Start Date: {$data['start_date']}, Due Date: {$data['due_date']}, Status: {$data['status']}, Father: {$data['father']}";
    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'pregnant', NOW(), 'Admin'
    )";
    $conn->query($auditSql);

    // ✅ Update or Insert 2nd Trimester Schedule
    if (!empty($data['second_trimester_date'])) {
        $check2nd = "SELECT * FROM schedules WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = '2nd Trimester'";
        $result2nd = $conn->query($check2nd);

        if ($result2nd && $result2nd->num_rows > 0) {
            $update2nd = "UPDATE schedules SET sched_date = '{$data['second_trimester_date']}' 
                          WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = '2nd Trimester'";
            $conn->query($update2nd);
        } else {
            $insert2nd = "INSERT INTO schedules (pregnant_id, activity, sched_date) 
                          VALUES ('{$data['pregnant_id']}', '2nd Trimester', '{$data['second_trimester_date']}')";
            $conn->query($insert2nd);
        }
    }

    // ✅ Update or Insert 3rd Trimester Schedule
    if (!empty($data['third_trimester_date'])) {
        $check3rd = "SELECT * FROM schedules WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = '3rd Trimester'";
        $result3rd = $conn->query($check3rd);

        if ($result3rd && $result3rd->num_rows > 0) {
            $update3rd = "UPDATE schedules SET sched_date = '{$data['third_trimester_date']}' 
                          WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = '3rd Trimester'";
            $conn->query($update3rd);
        } else {
            $insert3rd = "INSERT INTO schedules (pregnant_id, activity, sched_date) 
                          VALUES ('{$data['pregnant_id']}', '3rd Trimester', '{$data['third_trimester_date']}')";
            $conn->query($insert3rd);
        }
    }

    // ✅ Update Pregnancy Due Date in Schedules (if due date is changed)
    if (!empty($data['due_date'])) {
        $checkDue = "SELECT * FROM schedules WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = 'Pregnancy Due Date'";
        $resultDue = $conn->query($checkDue);

        if ($resultDue && $resultDue->num_rows > 0) {
            $updateDue = "UPDATE schedules SET sched_date = '{$data['due_date']}' 
                          WHERE pregnant_id = '{$data['pregnant_id']}' AND activity = 'Pregnancy Due Date'";
            $conn->query($updateDue);
        } else {
            $insertDue = "INSERT INTO schedules (pregnant_id, activity, sched_date) 
                          VALUES ('{$data['pregnant_id']}', 'Pregnancy Due Date', '{$data['due_date']}')";
            $conn->query($insertDue);
        }
    }

    echo json_encode(["message" => "Pregnancy record and schedules updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
