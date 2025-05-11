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

// Get JSON payload
$input = json_decode(file_get_contents("php://input"), true);

$assign_id = isset($input['assign_id']) ? $conn->real_escape_string($input['assign_id']) : '';

if (empty($assign_id)) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

// Soft delete workflow assignment
$deleteAssignSql = "UPDATE workflow_assign 
                    SET is_deleted = 'true', last_updated = NOW() 
                    WHERE assign_id = '$assign_id'";

if ($conn->query($deleteAssignSql)) {
    if ($conn->affected_rows > 0) {
        // Soft delete associated workflow progress
        $deleteProgSql = "UPDATE workflow_prog 
                          SET is_deleted = 'true', last_updated = NOW() 
                          WHERE assign_id = '$assign_id'";

        $conn->query($deleteProgSql);  // Run regardless of success/failure

        // Audit log (run independently)
        $descriptionLogRaw = "Soft-deleted workflow assignment with ID $assign_id.";
        $descriptionLog = $conn->real_escape_string($descriptionLogRaw);

        $auditSql = "INSERT INTO audit_trail (
            user_id, action, description, target_table, date_recorded, user_type
        ) VALUES (
            '1', 'Delete', '$descriptionLog', 'workflow_assign', NOW(), 'Admin'
        )";  // Replace '1' with actual user ID if needed

        $conn->query($auditSql); // Log attempt, but don’t block result

        echo json_encode(["message" => "Workflow assignment soft-deleted successfully."]);
    } else {
        echo json_encode(["error" => "No rows affected. Entry may already be deleted or not exist."]);
    }
} else {
    echo json_encode(["error" => "Error soft-deleting workflow assignment: " . $conn->error]);
}

$conn->close();
?>
