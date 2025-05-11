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

$data = json_decode(file_get_contents("php://input"), true);

$staff_id = isset($data['staff_id']) ? $conn->real_escape_string($data['staff_id']) : '';

// Query to fetch assigned workflows for a specific staff member
$query = "SELECT wa.assign_id, wa.workflow_id, wa.staff_id, wa.status, wa.deadline, 
                 w.title as workflow_title, w.description as workflow_description, 
                 CONCAT(s.first_name, ' ', s.last_name) as staff_name, s.position as staff_position
          FROM workflow_assign wa
          JOIN workflows w ON wa.workflow_id = w.workflow_id
          INNER JOIN staff s ON wa.staff_id = s.staff_id
          WHERE wa.is_deleted != 'true'";

$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

$assignedWorkflows = [];



while ($row = $result->fetch_assoc()) {
    $assign_id = $row['assign_id'];
    $workflow_id = $row['workflow_id'];

    // Get workflow steps for this workflow assignment
    $stepsStmt = $conn->prepare("SELECT wp.step_id, wp.is_completed as is_completed, s.step_title, wp.date_completed 
                                 FROM workflow_prog wp
                                 JOIN steps s ON wp.step_id = s.step_id
                                 WHERE wp.assign_id = ? ORDER BY s.step_order ASC");
    $stepsStmt->bind_param("i", $assign_id);
    $stepsStmt->execute();
    $stepsResult = $stepsStmt->get_result();

    $steps = [];
    while ($stepRow = $stepsResult->fetch_assoc()) {
        $steps[] = $stepRow;
    }

    // Add steps to the assigned workflow
    $row['steps'] = $steps;
    $assignedWorkflows[] = $row;
}

echo json_encode([
    "success" => true,
    "assignedWorkflows" => $assignedWorkflows
]);

?>
