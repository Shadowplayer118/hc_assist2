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

$title = isset($input['title']) ? $conn->real_escape_string($input['title']) : '';
$description = isset($input['description']) ? $conn->real_escape_string($input['description']) : '';
$created_by = isset($input['created_by']) ? $conn->real_escape_string($input['created_by']) : '';
$staff_id = isset($input['staff_id']) ? $conn->real_escape_string($input['staff_id']) : '';
$steps = isset($input['steps']) ? $input['steps'] : [];

if (empty($title) || empty($created_by) || empty($staff_id)) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

// Insert into workflows table
$workflowSql = "INSERT INTO workflows (title, description, date_created, is_deleted, last_updated) 
                VALUES ('$title', '$description', NOW(), 'false', NOW())";

if ($conn->query($workflowSql)) {
    $workflowId = $conn->insert_id;

    // Insert steps
    $stepIndex = 1;
    foreach ($steps as $stepText) {
        $escapedStep = $conn->real_escape_string($stepText);
        $conn->query("INSERT INTO steps (workflow_id, step_order, step_title, is_deleted, last_updated) 
                      VALUES ('$workflowId', '$stepIndex', '$escapedStep', 'false', NOW())");
        $stepIndex++;
    }

    $stepCount = $stepIndex - 1;

    // Insert into audit_trail
    $descriptionLogRaw = "Created workflow '$title' with $stepCount step(s).";
    $descriptionLog = $conn->real_escape_string($descriptionLogRaw);

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Insert', '$descriptionLog', 'workflow', NOW(), 'Admin'
    )";

    if (!$conn->query($auditSql)) {
        echo json_encode(["error" => "Workflow saved, but audit trail failed: " . $conn->error]);
    } else {
        echo json_encode(["message" => "Workflow added successfully."]);
    }
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
