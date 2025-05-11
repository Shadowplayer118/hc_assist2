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

// Get JSON payload
$input = json_decode(file_get_contents("php://input"), true);

$workflow_id = isset($input['workflow_id']) ? $conn->real_escape_string($input['workflow_id']) : '';
$title = isset($input['title']) ? $conn->real_escape_string($input['title']) : '';
$description = isset($input['description']) ? $conn->real_escape_string($input['description']) : '';
$staff_id = isset($input['staff_id']) ? $conn->real_escape_string($input['staff_id']) : '';
$steps = isset($input['steps']) ? $input['steps'] : [];

if (empty($workflow_id) || empty($title) || empty($staff_id)) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

// Update workflow info
$workflowSql = "UPDATE workflows SET title = '$title', description = '$description', last_updated = NOW() WHERE workflow_id = '$workflow_id'";

if ($conn->query($workflowSql)) {
    // Delete existing steps (hard-delete for simplicity)
    $conn->query("DELETE FROM steps WHERE workflow_id = '$workflow_id'");

    // Re-insert steps
    $insertedSteps = 0;
    foreach ($steps as $step) {
        $stepTitle = $conn->real_escape_string($step['step_title']);
        $stepOrder = $insertedSteps + 1;
        if ($conn->query("INSERT INTO steps (workflow_id, step_order, step_title, is_deleted, last_updated) VALUES ('$workflow_id', '$stepOrder', '$stepTitle', 'false', NOW())")) {
            $insertedSteps++;
        }
    }

    // Audit trail
    $descRaw = "Edited workflow '$title' with $insertedSteps step(s).";
    $desc = $conn->real_escape_string($descRaw);
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Update', '$desc', 'workflow', NOW(), 'Admin'
    )";

    if (!$conn->query($auditSql)) {
        echo json_encode(["error" => "Audit trail failed: " . $conn->error]);
        $conn->close();
        exit;
    }

    echo json_encode(["message" => "Workflow updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
