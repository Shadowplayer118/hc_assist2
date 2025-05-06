<?php
// CORS headers
header("Access-Control-Allow-Origin: *"); // Allow all origins (adjust to a specific origin in production)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../../db.php"); // Adjusted path to db.php

$sql = "SELECT * FROM patient WHERE is_deleted != 'true'";
$result = $conn->query($sql);

$patients = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $patients[] = $row;
    }
}

echo json_encode($patients);
