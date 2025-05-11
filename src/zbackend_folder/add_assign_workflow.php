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

// Sanitize the data from the request
$staff_id = isset($data['staff_id']) ? $conn->real_escape_string($data['staff_id']) : '';
$workflow_id = isset($data['workflow_id']) ? $conn->real_escape_string($data['workflow_id']) : '';
$deadline = isset($data['deadline']) ? $conn->real_escape_string($data['deadline']) : '';

// Validate input data
if (empty($staff_id) || empty($workflow_id) || empty($deadline)) {
    echo json_encode(["error" => "Staff ID, Workflow ID, and Deadline are required"]);
    exit();
}

// Insert into workflow_assign table
$insertAssignSql = "INSERT INTO workflow_assign (workflow_id, staff_id, status, deadline, is_deleted, date_assigned) 
                    VALUES ('$workflow_id', '$staff_id', 'pending', '$deadline', 'false', NOW())";
if ($conn->query($insertAssignSql)) {
    $assign_id = $conn->insert_id;  // Get the insert ID for the new workflow assignment

    // Now, insert the steps for the assigned workflow into workflow_prog
    // Get steps from the workflow
    $stepsStmt = $conn->prepare("SELECT step_id FROM steps WHERE workflow_id = ?");
    $stepsStmt->bind_param("i", $workflow_id);
    $stepsStmt->execute();
    $stepsResult = $stepsStmt->get_result();

    while ($stepRow = $stepsResult->fetch_assoc()) {
        $step_id = $stepRow['step_id'];
        
        // Insert into workflow_prog for each step
        $insertStepSql = "INSERT INTO workflow_prog (assign_id, step_id, is_completed, date_completed, last_updated) 
                          VALUES ('$assign_id', '$step_id', 'false', NULL, NOW())";
        $conn->query($insertStepSql);
    }

    // Return success message
    echo json_encode(["success" => true, "message" => "Workflow assigned and steps initialized successfully"]);
} else {
    echo json_encode(["error" => "Error assigning workflow: " . $conn->error]);
}

$conn->close();
?>
