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
$patient_id = $data['patient_id'] ?? null;
$start_date = $data['start_date'] ?? null;  // Optional: start date for filtering
$end_date = $data['end_date'] ?? null;      // Optional: end date for filtering

// Validate patient ID
if (!$patient_id) {
    echo json_encode(['error' => 'Missing patient_id']);
    exit;
}

// Prepare response data
$response = [
    'records' => [],
    'patient_info' => null
];

// Build the SQL query
$record_sql = "SELECT medical_id, patient_id, date_recorded, weight, height, blood_pressure, heart_rate, temperature 
               FROM medical_record 
               WHERE patient_id = ? AND is_deleted='false'";

// Add date filter if provided
if ($start_date) {
    $record_sql .= " AND date_recorded >= ?";
}
if ($end_date) {
    $record_sql .= " AND date_recorded <= ?";
}

$stmt = $conn->prepare($record_sql);
if ($start_date && $end_date) {
    // Both start and end dates
    $stmt->bind_param("iss", $patient_id, $start_date, $end_date);
} elseif ($start_date) {
    // Only start date
    $stmt->bind_param("is", $patient_id, $start_date);
} elseif ($end_date) {
    // Only end date
    $stmt->bind_param("is", $patient_id, $end_date);
} else {
    // No date filter
    $stmt->bind_param("i", $patient_id);
}

$stmt->execute();
$record_result = $stmt->get_result();
$response['records'] = $record_result->fetch_all(MYSQLI_ASSOC);

// Fetch patient profile
$profile_sql = "SELECT first_name, last_name, patient_image 
                FROM patient 
                WHERE patient_id = ?";
$stmt = $conn->prepare($profile_sql);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$profile_result = $stmt->get_result();
$response['patient_info'] = $profile_result->fetch_assoc();

// Return JSON response
echo json_encode($response);

$conn->close();
?>
