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

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);
$patient_id = $input['patient_id'] ?? '';

if ($patient_id === '') {
    echo json_encode(["error" => "Missing patient_id"]);
    exit;
}

// Sanitize input
$patient_id = $conn->real_escape_string($patient_id);

// Query gender
$sql = "SELECT gender FROM patient WHERE patient_id = '$patient_id'";
$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    echo json_encode(["gender" => $row['gender']]);
} else {
    echo json_encode(["error" => "Patient not found"]);
}

$conn->close();
?>
