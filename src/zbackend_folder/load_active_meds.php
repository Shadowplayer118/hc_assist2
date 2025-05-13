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

// Fetch meds data
$query = "SELECT item_name, brand, category, units, price, med_image FROM meds WHERE is_deleted != 'true'";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(['error' => 'Database query failed']);
    http_response_code(500);
    exit();
}

$meds_list = [];

while ($row = $result->fetch_assoc()) {
    $meds_list[] = $row;
}

echo json_encode(['meds' => $meds_list]);
?>
