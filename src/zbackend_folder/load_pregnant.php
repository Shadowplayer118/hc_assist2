<?php
// Headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);
$patient_id = $data['patient_id'] ?? null;
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;

// Validate
if (!$patient_id) {
    echo json_encode(['error' => 'Missing patient_id']);
    exit;
}

// Prepare response
$response = [
    'pregnant' => [],
    'patient_info' => null
];

// SQL for pregnant records
$pregnant_sql = "SELECT pregnant_id, start_date, status, father, father_contact, date_recorded, due_date, last_updated
                 FROM pregnant
                 WHERE patient_id = ? AND is_deleted = 'false'";

$params = [$patient_id];
$types = "i";

if ($start_date) {
    $pregnant_sql .= " AND date_recorded >= ?";
    $params[] = $start_date;
    $types .= "s";
}
if ($end_date) {
    $pregnant_sql .= " AND date_recorded <= ?";
    $params[] = $end_date;
    $types .= "s";
}

$stmt = $conn->prepare($pregnant_sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$pregnant_result = $stmt->get_result();
$response['pregnant'] = $pregnant_result->fetch_all(MYSQLI_ASSOC);

// Get patient info
$profile_sql = "SELECT first_name, last_name, patient_image FROM patient WHERE patient_id = ?";
$stmt = $conn->prepare($profile_sql);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$profile_result = $stmt->get_result();
$response['patient_info'] = $profile_result->fetch_assoc();

// Output result
echo json_encode($response);
$conn->close();
?>
