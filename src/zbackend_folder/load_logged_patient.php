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

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate patient_id
if (!isset($data['patient_id'])) {
    echo json_encode(['error' => 'Unauthorized: No patient ID provided']);
    http_response_code(401);
    exit();
}

$patient_id = intval($data['patient_id']);


// Get patient data
$query = "SELECT * FROM patient WHERE patient_id = ? AND is_deleted != 'true'";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Patient not found']);
    http_response_code(404);
    exit();
}

$patient = $result->fetch_assoc();

// Get latest medical record
$recordQuery = "SELECT * FROM medical_record WHERE patient_id = ? ORDER BY date_recorded DESC LIMIT 1";
$recordStmt = $conn->prepare($recordQuery);
$recordStmt->bind_param("i", $patient_id);
$recordStmt->execute();
$recordResult = $recordStmt->get_result();

$latest_record = $recordResult->fetch_assoc();

echo json_encode([
    'patient' => $patient,
    'latest_medical_record' => $latest_record
]);
?>
