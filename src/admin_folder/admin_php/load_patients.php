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

$data = json_decode(file_get_contents("php://input"), true);

$query = "SELECT * FROM patient WHERE is_deleted != 'true'";
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

if (!empty($data['blood_type'])) {
    $query .= " AND blood_type = ?";
    $params[] = $data['blood_type'];
    $types .= "s";
}

if (!empty($data['age'])) {
    $query .= " AND age = ?";
    $params[] = $data['age'];
    $types .= "i";
}

if (!empty($data['purok'])) {
    $query .= " AND purok = ?";
    $params[] = $data['purok'];
    $types .= "s";
}

if (!empty($data['household'])) {
    $query .= " AND household = ?";
    $params[] = $data['household'];
    $types .= "s";
}

$query .= " ORDER BY patient_id DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$patients = [];
$bloodTypes = [];
$ages = [];
$puroks = [];
$households = [];

while ($row = $result->fetch_assoc()) {
    $patients[] = $row;

    // Collect unique values for filter dropdowns
    if (!in_array($row['blood_type'], $bloodTypes)) $bloodTypes[] = $row['blood_type'];
    if (!in_array($row['age'], $ages)) $ages[] = $row['age'];
    if (!in_array($row['purok'], $puroks)) $puroks[] = $row['purok'];
    if (!in_array($row['household'], $households)) $households[] = $row['household'];
}

echo json_encode([
    'patients' => $patients,
    'filters' => [
        'blood_types' => $bloodTypes,
        'ages' => $ages,
        'puroks' => $puroks,
        'households' => $households,
    ]
]);
?>
