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

$data = json_decode(file_get_contents("php://input"), true);

$expired_id = $data['expired_id'] ?? null;
$discard_units = intval($data['discard_units'] ?? 0);

if (!$expired_id || $discard_units <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid input."]);
    exit();
}

// Get meds_id and stocked_in from expired_meds
$stmt = $conn->prepare("SELECT meds_id, stocked_in FROM expired_meds WHERE exp_id = ?");
$stmt->bind_param("i", $expired_id);
$stmt->execute();
$res = $stmt->get_result();
if (!$row = $res->fetch_assoc()) {
    echo json_encode(["success" => false, "message" => "Expired stock not found."]);
    exit();
}

$meds_id = $row['meds_id'];
$stocked_in = intval($row['stocked_in']);

// Cap discard_units to stocked_in max
$discard_units = min($discard_units, $stocked_in);

// 1. Update meds table
$updateMeds = $conn->prepare("UPDATE meds SET units = units - ? WHERE meds_id = ?");
$updateMeds->bind_param("ii", $discard_units, $meds_id);
if (!$updateMeds->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to update meds stock."]);
    exit();
}

// 2. Mark expired_meds as discarded
$updateExp = $conn->prepare("UPDATE expired_meds SET action_taken = 'discarded' WHERE exp_id = ?");
$updateExp->bind_param("i", $expired_id);
$updateExp->execute();

echo json_encode(["success" => true, "message" => "Expired stock discarded."]);
$conn->close();
?>
