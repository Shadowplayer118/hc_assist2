<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../../db.php");

// Prepare the base query to fetch logs from the audit_trail table
$query = "SELECT * FROM audit_trail WHERE 1";

// Apply filters if provided
if (!empty($data['date'])) {
    $query .= " AND DATE(date_recorded) = '" . $data['date'] . "'";
}

if (!empty($data['user'])) {
    $query .= " AND username LIKE '%" . $data['user'] . "%'";
}

if (!empty($data['action'])) {
    $query .= " AND action LIKE '%" . $data['action'] . "%'";
}

// Execute the query
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
    echo json_encode(['logs' => $logs]);
} else {
    echo json_encode(['logs' => []]);
}
?>
