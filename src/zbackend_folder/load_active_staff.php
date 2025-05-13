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

// Optional: You can use POST with a token or admin ID check here for secure access

// Fetch staff data
$query = "SELECT first_name, last_name, staff_image, contact, purok_assigned, is_active FROM staff WHERE is_deleted != 'true'";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(['error' => 'Database query failed']);
    http_response_code(500);
    exit();
}

$staff_list = [];

while ($row = $result->fetch_assoc()) {
    $staff_list[] = $row;
}

echo json_encode(['staff' => $staff_list]);
?>
