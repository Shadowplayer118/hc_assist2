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

require_once("../db.php"); // Adjust path if needed

$data = json_decode(file_get_contents("php://input"), true);
$patient_id = $data['patient_id'] ?? null;
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;

// Validate patient ID
if (!$patient_id) {
    echo json_encode(['error' => 'Missing patient_id']);
    exit;
}

// Update all schedules with a date lower than today, setting status to 'missing'
$today = date('Y-m-d');  // Get today's date
$update_sql = "UPDATE schedules SET status = 'missing' WHERE sched_date < ?";
$stmt = $conn->prepare($update_sql);
$stmt->bind_param("s", $today);
$stmt->execute();

// Prepare response array
$response = [
    'schedule' => [],
    'patient_info' => null
];

// Build query to fetch schedules
$sched_sql = "SELECT sched_id, sched_type, sched_date, activity, status
              FROM schedules
              WHERE patient_id = ? AND status != 'cancelled'";

// Add optional date filtering
if ($start_date) {
    $sched_sql .= " AND sched_date >= ?";
}
if ($end_date) {
    $sched_sql .= " AND sched_date <= ?";
}

$stmt = $conn->prepare($sched_sql);
if ($start_date && $end_date) {
    $stmt->bind_param("iss", $patient_id, $start_date, $end_date);
} elseif ($start_date) {
    $stmt->bind_param("is", $patient_id, $start_date);
} elseif ($end_date) {
    $stmt->bind_param("is", $patient_id, $end_date);
} else {
    $stmt->bind_param("i", $patient_id);
}

$stmt->execute();
$sched_result = $stmt->get_result();
$response['schedule'] = $sched_result->fetch_all(MYSQLI_ASSOC);

// Fetch patient info
$profile_sql = "SELECT first_name, last_name, patient_image
                FROM patient 
                WHERE patient_id = ?";
$stmt = $conn->prepare($profile_sql);
$stmt->bind_param("i", $patient_id);
$stmt->execute();
$profile_result = $stmt->get_result();
$response['patient_info'] = $profile_result->fetch_assoc();

// Return the JSON response
echo json_encode($response);

$conn->close();
?>
