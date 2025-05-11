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

$sql = "SELECT staff_id, first_name, last_name, position FROM staff WHERE position IN ('midwife', 'staff') AND is_deleted != 'true'";
$result = $conn->query($sql);

$staffList = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $staffList[] = [
            'staff_id' => $row['staff_id'],
            'full_name' => $row['first_name'] . ' ' . $row['last_name'],
            'position' => $row['position']
        ];
    }

    echo json_encode([
        "success" => true,
        "staff" => $staffList
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => $conn->error
    ]);
}

$conn->close();
