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

$today = date("Y-m-d");
$meds_id = $data['meds_id'] ?? null;
if (!$meds_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing meds_id.',
    ]);
    exit();
}

$query = "
    SELECT em.*, m.item_name
    FROM expired_meds em
    INNER JOIN meds m ON em.meds_id = m.meds_id
    WHERE em.meds_id = ?
      AND em.exp_date IS NOT NULL
      AND em.exp_date <= ?
      AND em.action_taken = 'none'
    ORDER BY em.exp_date ASC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("is", $meds_id, $today);
$stmt->execute();
$result = $stmt->get_result();

$expiredStocks = [];
$itemName = null;

while ($row = $result->fetch_assoc()) {
    if (!$itemName) {
        $itemName = $row['item_name'];
    }
    $expiredStocks[] = $row;
}

echo json_encode([
    'success' => true,
    'item_name' => $itemName,
    'expired_stocks' => $expiredStocks,
]);

$conn->close();
?>
