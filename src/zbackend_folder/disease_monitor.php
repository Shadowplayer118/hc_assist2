<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../db.php"); // Make sure to include the database connection file

// Query to get the count of patients with each disease and 'Ongoing' status
$query = "
    SELECT 
        d.disease_name, 
        COUNT(d.disease_id) AS ongoing_count
    FROM disease d
    INNER JOIN patient p ON p.patient_id = d.patient_id
    WHERE d.disease_status = 'Ongoing'
    AND d.is_deleted != 'true'
    GROUP BY d.disease_name
";

// Query to get the total number of patients with any disease
$totalPatientsQuery = "
    SELECT COUNT(DISTINCT patient_id) AS total_patients
    FROM patient
";

// Execute the query to get ongoing disease count per disease_name
$result = $conn->query($query);
$ongoingDiseases = [];
while ($row = $result->fetch_assoc()) {
    $ongoingDiseases[] = [
        'disease_name' => $row['disease_name'],
        'ongoing_count' => $row['ongoing_count']
    ];
}

// Execute the query to get total number of patients with any disease
$totalPatientsResult = $conn->query($totalPatientsQuery);
$totalPatients = $totalPatientsResult->fetch_assoc()['total_patients'];

// Calculate percentage of ongoing disease patients
$queryNonOngoing = "
    SELECT COUNT(DISTINCT patient_id) AS non_ongoing_count
    FROM disease
    WHERE disease_status != 'Ongoing'

";
$nonOngoingResult = $conn->query($queryNonOngoing);
$nonOngoingCount = $nonOngoingResult->fetch_assoc()['non_ongoing_count'];

$ongoingPercentage = ($ongoingDiseases ? array_sum(array_column($ongoingDiseases, 'ongoing_count')) : 0) / $totalPatients * 100;
$nonOngoingPercentage = ($nonOngoingCount / $totalPatients) * 100;

$response = [
    'ongoing_diseases' => $ongoingDiseases,
    'ongoing_percentage' => $ongoingPercentage,
    'non_ongoing_percentage' => $nonOngoingPercentage
];

echo json_encode($response);
?>
