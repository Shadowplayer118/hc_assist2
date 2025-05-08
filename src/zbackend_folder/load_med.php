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

$query = "SELECT * FROM meds WHERE is_deleted != 'true'";
$params = [];
$types = "";

if (!empty($data['item_name'])) {
    $query .= " AND item_name LIKE ?";
    $itemName = "%" . $data['item_name'] . "%";
    $params[] = $itemName;
    $types .= "s";
}

if (!empty($data['brand'])) {
    $query .= " AND brand = ?";
    $params[] = $data['brand'];
    $types .= "s";
}

if (!empty($data['category'])) {
    $query .= " AND category = ?";
    $params[] = $data['category'];
    $types .= "s";
}

$query .= " ORDER BY meds_id DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$meds = [];
$brands = [];
$categories = [];

while ($row = $result->fetch_assoc()) {
    $meds[] = $row;

    // Collect unique values for filter dropdowns
    if (!in_array($row['brand'], $brands)) $brands[] = $row['brand'];
    if (!in_array($row['category'], $categories)) $categories[] = $row['category'];
}

echo json_encode([
    'meds' => $meds,
    'filters' => [
        'brands' => $brands,
        'categories' => $categories,
    ]
]);

$conn->close();
?>
