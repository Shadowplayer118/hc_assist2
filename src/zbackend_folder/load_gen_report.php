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

// Get month and year from query, fallback to current
$currentYear = isset($_GET['year']) ? $_GET['year'] : date('Y');
$currentMonth = isset($_GET['month']) ? $_GET['month'] : date('m');

// Get total non-deleted patients
$totalQuery = "SELECT COUNT(*) as total FROM patient WHERE is_deleted != 'true'";
$totalResult = $conn->query($totalQuery);
$totalPatients = $totalResult->fetch_assoc()['total'];

// Helper function to calculate percentage
function getPercentage($count, $total) {
    return $total > 0 ? round(($count / $total) * 100, 2) : 0;
}

// Referrals
$referralQuery = "
    SELECT COUNT(*) as count 
    FROM referrals 
    WHERE is_deleted != 'true' 
      AND MONTH(date_created) = ? 
      AND YEAR(date_created) = ?";
$stmt = $conn->prepare($referralQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$referrals = $stmt->get_result()->fetch_assoc()['count'];

// Pregnant
$pregnantQuery = "
    SELECT COUNT(DISTINCT patient_id) as count 
    FROM pregnant 
    WHERE is_deleted != 'true' 
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?";
$stmt = $conn->prepare($pregnantQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$pregnant = $stmt->get_result()->fetch_assoc()['count'];

// Disease
$diseaseQuery = "
    SELECT COUNT(DISTINCT patient_id) as count 
    FROM disease 
    WHERE is_deleted != 'true' 
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?";
$stmt = $conn->prepare($diseaseQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$disease = $stmt->get_result()->fetch_assoc()['count'];

// Immunization
$immuQuery = "
    SELECT COUNT(DISTINCT patient_id) as count 
    FROM immu 
    WHERE is_deleted != 'true'  
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?";
$stmt = $conn->prepare($immuQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$immu = $stmt->get_result()->fetch_assoc()['count'];

// Under 18
$ChildrenQuery = "
    SELECT COUNT(*) as count 
    FROM patient 
    WHERE is_deleted != 'true' 
      AND TIMESTAMPDIFF(YEAR, bdate, CURDATE()) < 18 
      AND MONTH(date_created) = ? 
      AND YEAR(date_created) = ?";
$stmt = $conn->prepare($ChildrenQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$Children = $stmt->get_result()->fetch_assoc()['count'];

// Total total
$Total = $referrals + $pregnant + $disease + $immu + $Children;

// Final output
echo json_encode([
    'total_patients' => (int)$totalPatients,
    'referrals' => [
        'count' => (int)$referrals,
        'percentage' => getPercentage($referrals, $totalPatients)
    ],
    'pregnant' => [
        'count' => (int)$pregnant,
        'percentage' => getPercentage($pregnant, $totalPatients)
    ],
    'disease' => [
        'count' => (int)$disease,
        'percentage' => getPercentage($disease, $totalPatients)
    ],
    'immunization' => [
        'count' => (int)$immu,
        'percentage' => getPercentage($immu, $totalPatients)
    ],
    'Children' => [
        'count' => (int)$Children,
        'percentage' => getPercentage($Children, $totalPatients)
    ],
    'Total' => [
        'count' => (int)$Total,
        'percentage' => getPercentage($Total, $totalPatients)
    ]
]);
?>
