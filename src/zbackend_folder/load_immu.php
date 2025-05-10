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

require_once("../db.php"); // Adjust path as needed

$data = json_decode(file_get_contents("php://input"), true);
$patient_id = $data['patient_id'] ?? null;  // Patient ID from the request
$start_date = $data['start_date'] ?? null;  // Optional: start date for filtering
$end_date = $data['end_date'] ?? null;      // Optional: end date for filtering

// Validate patient ID
if (!$patient_id) {
    echo json_encode(['error' => 'Missing patient_id']);
    exit;
}

// Prepare response structure
$response = [
    'immunizations' => [],
    'patient_info' => null
];

// Build SQL to fetch immunizations
$immu_sql = "SELECT immu_name, date_administered ,immu_id
             FROM immu 
             WHERE patient_id = ? AND is_deleted = 'false'";

$params = [$patient_id];
$types = "i";

if ($start_date) {
    $immu_sql .= " AND date_administered >= ?";
    $types .= "s";
    $params[] = $start_date;
}
if ($end_date) {
    $immu_sql .= " AND date_administered <= ?";
    $types .= "s";
    $params[] = $end_date;
}

$stmt = $conn->prepare($immu_sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();
$response['immunizations'] = $result->fetch_all(MYSQLI_ASSOC);

// Fetch patient profile
$profile_sql = "SELECT first_name, last_name, patient_image FROM patient WHERE patient_id = ?";
$stmt = $conn->prepare($profile_sql);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$profile_result = $stmt->get_result();
$response['patient_info'] = $profile_result->fetch_assoc();

// Output response
echo json_encode($response);

$conn->close();
?>
