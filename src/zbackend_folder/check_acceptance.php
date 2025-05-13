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

$response = [];

if (!empty($data['patient_id'])) {
    $query = "SELECT has_accepted FROM patient WHERE patient_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data['patient_id']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $response['has_accepted'] = $row['has_accepted'];
    } else {
        $response['error'] = "Patient not found.";
    }
} else {
    $response['error'] = "Missing patient_id.";
}

echo json_encode($response);
?>
