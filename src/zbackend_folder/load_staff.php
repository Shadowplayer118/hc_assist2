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

$query = "SELECT * FROM staff WHERE is_deleted != 'true'";
$params = [];
$types = "";

if (!empty($data['name'])) {
    $query .= " AND (first_name LIKE ? OR mid_name LIKE ? OR last_name LIKE ?)";
    $name = "%" . $data['name'] . "%";
    $params[] = $name;
    $params[] = $name;
    $params[] = $name;
    $types .= "sss";
}

if (!empty($data['purok_assigned'])) {
    $query .= " AND purok_assigned = ?";
    $params[] = $data['purok_assigned'];
    $types .= "s";
}

if (!empty($data['position'])) {
    $query .= " AND position = ?";
    $params[] = $data['position'];
    $types .= "s";
}

$query .= " ORDER BY staff_id DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$staff = [];
$puroks = [];
$positions = [];

while ($row = $result->fetch_assoc()) {
    $staff[] = $row;

    // Collect unique values for filter dropdowns
    if (!in_array($row['purok_assigned'], $puroks)) $puroks[] = $row['purok_assigned'];
    if (!in_array($row['position'], $positions)) $positions[] = $row['position'];
}

echo json_encode([
    'staff' => $staff,
    'filters' => [
        'puroks' => $puroks,
        'positions' => $positions,
    ]
]);
?>
