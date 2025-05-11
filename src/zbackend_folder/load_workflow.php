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

// Optional filters
$query = "SELECT * FROM workflows WHERE is_deleted != 'true'";
$params = [];
$types = "";

if (!empty($data['title'])) {
    $query .= " AND title LIKE ?";
    $params[] = "%" . $data['title'] . "%";
    $types .= "s";
}

$query .= " ORDER BY workflow_id ASC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$workflows = [];

while ($row = $result->fetch_assoc()) {
    $workflow_id = $row['workflow_id'];

    // Get steps for this workflow
    $stepsStmt = $conn->prepare("SELECT * FROM steps WHERE workflow_id = ? ORDER BY step_order ASC");
    $stepsStmt->bind_param("i", $workflow_id);
    $stepsStmt->execute();
    $stepsResult = $stepsStmt->get_result();

    $steps = [];
    while ($stepRow = $stepsResult->fetch_assoc()) {
        $steps[] = $stepRow;
    }

    $row['steps'] = $steps;
    $workflows[] = $row;
}

echo json_encode([
    "success" => true,
    "workflows" => $workflows
]);

?>
