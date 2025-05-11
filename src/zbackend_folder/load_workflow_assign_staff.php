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

// ✅ 1. Update status to 'missing' or 'pending' based on deadline
$conn->query("
    UPDATE workflow_assign 
    SET status = 'missing'
    WHERE deadline < CURDATE() AND is_deleted != 'true'
");

$conn->query("
    UPDATE workflow_assign 
    SET status = 'pending'
    WHERE deadline >= CURDATE() AND is_deleted != 'true'
");

// ✅ 2. Evaluate step completion for each assign_id
$assignQuery = "SELECT assign_id, deadline FROM workflow_assign WHERE is_deleted != 'true'";
$assignResult = $conn->query($assignQuery);

while ($assign = $assignResult->fetch_assoc()) {
    $assign_id = $assign['assign_id'];
    $deadline = $assign['deadline'];

    // Count total and completed steps
    $stepQuery = $conn->prepare("
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN is_completed = 'true' THEN 1 ELSE 0 END) as completed 
        FROM workflow_prog 
        WHERE assign_id = ?
    ");
    $stepQuery->bind_param("i", $assign_id);
    $stepQuery->execute();
    $stepResult = $stepQuery->get_result()->fetch_assoc();

    $total = $stepResult['total'];
    $completed = $stepResult['completed'];

    if ($total > 0) {
        if ($completed == $total) {
            // All steps completed
            $conn->query("UPDATE workflow_assign SET status = 'completed' WHERE assign_id = $assign_id");
        } else {
            // Some steps incomplete
            $newStatus = (strtotime($deadline) < strtotime(date('Y-m-d'))) ? 'missing' : 'pending';
            $conn->query("UPDATE workflow_assign SET status = '$newStatus' WHERE assign_id = $assign_id");
        }
    }
}

// ✅ 3. Fetch data to return for a specific staff_id
$data = json_decode(file_get_contents("php://input"), true);
$staff_id = isset($data['staff_id']) ? $data['staff_id'] : '';

if (empty($staff_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Missing staff_id in request."
    ]);
    exit;
}

$query = "SELECT wa.assign_id, wa.workflow_id, wa.staff_id, wa.status, wa.deadline, 
                 w.title as workflow_title, w.description as workflow_description, 
                 CONCAT(s.first_name, ' ', s.last_name) as staff_name, s.position as staff_position
          FROM workflow_assign wa
          JOIN workflows w ON wa.workflow_id = w.workflow_id
          INNER JOIN staff s ON wa.staff_id = s.staff_id
          WHERE wa.is_deleted != 'true' AND wa.staff_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $staff_id); // "s" if staff_id is a string, "i" if it's an integer
$stmt->execute();
$result = $stmt->get_result();

$assignedWorkflows = [];

while ($row = $result->fetch_assoc()) {
    $assign_id = $row['assign_id'];

    // Get steps
    $stepsStmt = $conn->prepare("SELECT wp.step_id, wp.is_completed, s.step_title, wp.prog_id, wp.date_completed 
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

    $row['steps'] = $steps;
    $assignedWorkflows[] = $row;
}

echo json_encode([
    "success" => true,
    "assignedWorkflows" => $assignedWorkflows
]);

$conn->close();
?>
