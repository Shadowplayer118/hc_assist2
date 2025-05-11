<?php
require_once("../db.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// For debugging only
// file_put_contents("debug_log.txt", $rawInput);

if (!$data || !isset($data['prog_id']) || !isset($data['is_completed'])) {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$prog_id = $conn->real_escape_string($data['prog_id']);
$is_completed = $data['is_completed'] === "true" ? 'true' : 'false';
$date_completed = $is_completed === 'true' ? "NOW()" : "NULL";

$query = "UPDATE workflow_prog 
          SET is_completed = ?, 
              date_completed = $date_completed,
              last_updated = NOW() 
          WHERE prog_id = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("si", $is_completed, $prog_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>
