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
    $query = "UPDATE patient SET has_accepted = 'true' WHERE patient_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data['patient_id']);
    if ($stmt->execute()) {
        $response['status'] = "success";
    } else {
        $response['status'] = "error";
        $response['message'] = "Update failed.";
    }
} else {
    $response['status'] = "error";
    $response['message'] = "Missing patient_id.";
}

echo json_encode($response);
?>
