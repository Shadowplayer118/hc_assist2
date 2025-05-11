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
$staff_id = isset($input['staff_id']) ? $conn->real_escape_string($input['staff_id']) : '';
$title = isset($input['title']) ? $conn->real_escape_string($input['title']) : '';

if (empty($workflow_id) || empty($staff_id) || empty($title)) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

// Check if workflow is assigned to any staff
$checkAssignSql = "SELECT COUNT(*) as total FROM workflow_assign WHERE workflow_id = '$workflow_id' AND is_deleted != 'true'";
$checkResult = $conn->query($checkAssignSql);
$assignData = $checkResult->fetch_assoc();

if ($assignData['total'] > 0) {
    echo json_encode(["error" => "Cannot delete workflow. It is still assigned to one or more staff members."]);
    exit;
}

// Soft delete workflow
$deleteSql = "UPDATE workflows SET is_deleted = 'true', last_updated = NOW() WHERE workflow_id = '$workflow_id'";

if ($conn->query($deleteSql)) {
    // Insert into audit_trail
    $descriptionLogRaw = "Soft-deleted workflow '$title'.";
    $descriptionLog = $conn->real_escape_string($descriptionLogRaw);

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staff_id', 'Delete', '$descriptionLog', 'workflow', NOW(), 'Admin'
    )";

    if (!$conn->query($auditSql)) {
        echo json_encode(["error" => "Workflow deleted, but audit trail failed: " . $conn->error]);
    } else {
        echo json_encode(["message" => "Workflow soft-deleted successfully."]);
    }
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
