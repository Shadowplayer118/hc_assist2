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

// Base query: join with staff and patient to get full names
$query = "
    SELECT 
        a.*, 
        COALESCE(CONCAT(s.first_name, ' ', s.last_name), CONCAT(p.first_name, ' ', p.last_name)) AS full_name,
        CASE 
            WHEN s.staff_id IS NOT NULL THEN 'staff'
            WHEN p.patient_id IS NOT NULL THEN 'patient'
            ELSE 'unknown'
        END AS user_type
    FROM audit_trail a
    LEFT JOIN staff s ON a.user_id = s.staff_id
    LEFT JOIN patient p ON a.user_id = p.patient_id
    WHERE 1
";

// Apply filters
if (!empty($data['date'])) {
    $query .= " AND DATE(a.date_recorded) = '" . $conn->real_escape_string($data['date']) . "'";
}
if (!empty($data['user'])) {
    $search = $conn->real_escape_string($data['user']);
    $query .= " AND (
        CONCAT(s.first_name, ' ', s.last_name) LIKE '%$search%' 
        OR CONCAT(p.first_name, ' ', p.last_name) LIKE '%$search%'
    )";
}
if (!empty($data['action'])) {
    $query .= " AND a.action LIKE '%" . $conn->real_escape_string($data['action']) . "%'";
}
if (!empty($data['target_table'])) {
    $query .= " AND a.target_table LIKE '%" . $conn->real_escape_string($data['target_table']) . "%'";
}
$query .= " LIMIT 100";
// Execute query
$result = $conn->query($query);
$logs = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['username'] = $row['full_name'] . " ({$row['user_type']})";
        unset($row['full_name'], $row['user_type']);
        $logs[] = $row;
    }
}

// Fetch unique filter values
$actions = [];
$tables = [];

$actionResult = $conn->query("SELECT DISTINCT action FROM audit_trail ORDER BY action ASC");
while ($row = $actionResult->fetch_assoc()) {
    $actions[] = $row['action'];
}

$tableResult = $conn->query("SELECT DISTINCT target_table FROM audit_trail ORDER BY target_table ASC");
while ($row = $tableResult->fetch_assoc()) {
    $tables[] = $row['target_table'];
}

// Output full response
echo json_encode([
    'logs' => $logs,
    'filters' => [
        'actions' => $actions,
        'target_tables' => $tables
    ]
]);
?>
