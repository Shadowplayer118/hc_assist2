<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php");

$pregnant_id = isset($_GET['pregnant_id']) ? $conn->real_escape_string($_GET['pregnant_id']) : '';

if (!$pregnant_id) {
    echo json_encode(["error" => "Missing pregnant_id"]);
    exit;
}

$sql = "SELECT sched_date, activity FROM schedules WHERE pregnant_id = '$pregnant_id'";
$result = $conn->query($sql);

$schedules = [];

while ($row = $result->fetch_assoc()) {
    $schedules[] = $row;
}

echo json_encode($schedules);

$conn->close();
