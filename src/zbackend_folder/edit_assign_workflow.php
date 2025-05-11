<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php");

// Get the JSON input data
$data = json_decode(file_get_contents("php://input"), true);

// Sanitize and validate input
$assign_id = isset($data['assign_id']) ? $conn->real_escape_string($data['assign_id']) : '';
$staff_id = isset($data['staff_id']) ? $conn->real_escape_string($data['staff_id']) : '';
$deadline = isset($data['deadline']) ? $conn->real_escape_string($data['deadline']) : '';
$steps_status = isset($data['steps_status']) ? $data['steps_status'] : []; // An array of steps with completion status

if (empty($assign_id) || empty($staff_id) || empty($deadline)) {
    echo json_encode(["error" => "Assign ID, Staff ID, and Deadline are required"]);
    exit();
}

// Begin transaction
$conn->begin_transaction();

try {
    // Update workflow_assign table
    $updateAssignSql = "UPDATE workflow_assign 
                        SET staff_id = '$staff_id', 
                            deadline = '$deadline', 
                            last_updated = NOW() 
                        WHERE assign_id = '$assign_id'";
    
    if (!$conn->query($updateAssignSql)) {
        throw new Exception("Error updating workflow assignment: " . $conn->error);
    }

    // Update the workflow_prog table for each step
    foreach ($steps_status as $step_status) {
        $step_id = $step_status['step_id'];
        $is_completed = $step_status['is_completed'] ? 'true' : 'false';
        $date_completed = ($is_completed === 'true') ? "NOW()" : "NULL";

        $updateStepSql = "UPDATE workflow_prog 
                          SET is_completed = '$is_completed', 
                              date_completed = $date_completed, 
                              last_updated = NOW() 
                          WHERE assign_id = '$assign_id' AND step_id = '$step_id'";

        if (!$conn->query($updateStepSql)) {
            throw new Exception("Error updating step progress: " . $conn->error);
        }
    }

    // Commit the transaction
    $conn->commit();

    // Optionally, log the update to audit_trail
    $description = $conn->real_escape_string("Updated workflow assignment ID $assign_id with staff ID $staff_id and deadline $deadline.");
    $auditSql = "INSERT INTO audit_trail (user_id, action, description, target_table, date_recorded, user_type) 
                 VALUES ('$staff_id', 'Update', '$description', 'workflow_assign', NOW(), 'Admin')";
    $conn->query($auditSql); // Ignore result for simplicity

    echo json_encode(["success" => true, "message" => "Workflow assignment updated successfully"]);

} catch (Exception $e) {
    // Rollback transaction in case of an error
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>
