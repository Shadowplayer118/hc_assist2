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
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;
$approval_status = $data['approval_status'] ?? null; // Added approval_status filter

// Validate patient ID
if (!$patient_id) {
    echo json_encode(['error' => 'Missing patient_id']);
    exit;
}

// Prepare response data
$response = [
    'referrals' => [],
    'patient_info' => null
];

// Build the SQL query to fetch referrals for the selected patient
$referral_sql = "SELECT referral_id, description, referral_date, approval_status, last_updated
                 FROM referrals 
                 WHERE patient_id = ? AND is_deleted = 'false'";

// Add date filter if provided
$params = [$patient_id];
$types = "i";

if ($start_date) {
    $referral_sql .= " AND referral_date >= ?";
    $types .= "s";
    $params[] = $start_date;
}
if ($end_date) {
    $referral_sql .= " AND referral_date <= ?";
    $types .= "s";
    $params[] = $end_date;
}

// Add approval status filter if provided
if ($approval_status) {
    $referral_sql .= " AND approval_status = ?";
    $types .= "s";
    $params[] = $approval_status;
}

$stmt = $conn->prepare($referral_sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$referral_result = $stmt->get_result();
$response['referrals'] = $referral_result->fetch_all(MYSQLI_ASSOC);

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
