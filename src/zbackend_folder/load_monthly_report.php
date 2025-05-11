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

// Get the requested month and year, or use the current date if not provided
$currentYear = isset($_GET['year']) ? $_GET['year'] : date('Y');
$currentMonth = isset($_GET['month']) ? $_GET['month'] : date('m');

// Function to get the count of patients based on condition
function countPatients($condition) {
    global $conn, $currentMonth, $currentYear;
    $query = "
        SELECT COUNT(DISTINCT p.patient_id) as total
        FROM patient p
        INNER JOIN medical_record mr ON p.patient_id = mr.patient_id
        WHERE p.is_deleted != 'true' 
          AND MONTH(mr.date_recorded) = ? 
          AND YEAR(mr.date_recorded) = ? 
          $condition
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $currentMonth, $currentYear);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return $result['total'];
}

// Function to get the average values for the medical records
function getAverage($field, $condition = '') {
    global $conn, $currentMonth, $currentYear;
    $query = "
        SELECT AVG(mr.$field) as avg_value
        FROM medical_record mr
        INNER JOIN patient p ON mr.patient_id = p.patient_id
        WHERE p.is_deleted != 'true'
          AND MONTH(mr.date_recorded) = ? 
          AND YEAR(mr.date_recorded) = ? 
          $condition
    ";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $currentMonth, $currentYear);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return round($result['avg_value'], 2);
}

// Total General Report (patients 18 to 65 years)
$totalGeneralCondition = "AND TIMESTAMPDIFF(YEAR, p.bdate, CURDATE()) BETWEEN 18 AND 65";
$totalGeneral = countPatients($totalGeneralCondition);

// Gender-based Breakdown (Total Male, Female for General Patients)
$totalMaleGeneral = countPatients($totalGeneralCondition . " AND p.gender = 'Male'");
$totalFemaleGeneral = countPatients($totalGeneralCondition . " AND p.gender = 'Female'");

// Average Weight, Height, Blood Pressure, Heart Rate for General Patients
$avgWeightGeneral = getAverage('weight', $totalGeneralCondition);
$avgHeightGeneral = getAverage('height', $totalGeneralCondition);
$avgBPGeneral = getAverage('blood_pressure', $totalGeneralCondition);
$avgHeartRateGeneral = getAverage('heart_rate', $totalGeneralCondition);

// Children Report (patients under 18)
$totalChildrenCondition = "AND TIMESTAMPDIFF(YEAR, p.bdate, CURDATE()) < 18";
$totalChildren = countPatients($totalChildrenCondition);

// Gender-based Breakdown for Children
$totalMaleChildren = countPatients($totalChildrenCondition . " AND p.gender = 'Male'");
$totalFemaleChildren = countPatients($totalChildrenCondition . " AND p.gender = 'Female'");

// Average Values for Children
$avgWeightChildren = getAverage('weight', $totalChildrenCondition);
$avgHeightChildren = getAverage('height', $totalChildrenCondition);
$avgBPChildren = getAverage('blood_pressure', $totalChildrenCondition);
$avgHeartRateChildren = getAverage('heart_rate', $totalChildrenCondition);

// Senior Report (patients 65 years and older)
$totalSeniorCondition = "AND TIMESTAMPDIFF(YEAR, p.bdate, CURDATE()) >= 65";
$totalSenior = countPatients($totalSeniorCondition);

// Gender-based Breakdown for Seniors
$totalMaleSenior = countPatients($totalSeniorCondition . " AND p.gender = 'Male'");
$totalFemaleSenior = countPatients($totalSeniorCondition . " AND p.gender = 'Female'");

// Average Values for Seniors
$avgWeightSenior = getAverage('weight', $totalSeniorCondition);
$avgHeightSenior = getAverage('height', $totalSeniorCondition);
$avgBPSenior = getAverage('blood_pressure', $totalSeniorCondition);
$avgHeartRateSenior = getAverage('heart_rate', $totalSeniorCondition);

// Pregnant Data (miscarriages, deliveries, trimesters)
$pregnantQuery = "
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN status = 'miscarriage' THEN 1 ELSE 0 END) as miscarried,
           SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
           SUM(CASE WHEN status = '1st trimester' THEN 1 ELSE 0 END) as first_trimester,
           SUM(CASE WHEN status = '2nd trimester' THEN 1 ELSE 0 END) as second_trimester,
           SUM(CASE WHEN status = '3rd trimester' THEN 1 ELSE 0 END) as third_trimester
    FROM pregnant
    WHERE is_deleted != 'true' 
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?
";
$stmt = $conn->prepare($pregnantQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$pregnantData = $stmt->get_result()->fetch_assoc();

// Disease Data (disease name, cured, ongoing)
$diseaseQuery = "
    SELECT disease_name, 
           SUM(CASE WHEN disease_status = 'cured' THEN 1 ELSE 0 END) as cured,
           SUM(CASE WHEN disease_status = 'ongoing' THEN 1 ELSE 0 END) as ongoing
    FROM disease
    WHERE is_deleted != 'true' 
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?
    GROUP BY disease_name
";
$stmt = $conn->prepare($diseaseQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$diseaseData = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Immunization Data (immunization name and count)
$immunizationQuery = "
    SELECT immu_name, COUNT(*) as total
    FROM immu
    WHERE is_deleted != 'true' 
      AND MONTH(date_recorded) = ? 
      AND YEAR(date_recorded) = ?
    GROUP BY immu_name
";
$stmt = $conn->prepare($immunizationQuery);
$stmt->bind_param("ss", $currentMonth, $currentYear);
$stmt->execute();
$immunizationData = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Return the report as JSON
echo json_encode([
    'general' => [
        'total' => $totalGeneral,
        'male' => $totalMaleGeneral,
        'female' => $totalFemaleGeneral,
        'avg_weight' => $avgWeightGeneral,
        'avg_height' => $avgHeightGeneral,
        'avg_blood_pressure' => $avgBPGeneral,
        'avg_heart_rate' => $avgHeartRateGeneral
    ],
    'children' => [
        'total' => $totalChildren,
        'male' => $totalMaleChildren,
        'female' => $totalFemaleChildren,
        'avg_weight' => $avgWeightChildren,
        'avg_height' => $avgHeightChildren,
        'avg_blood_pressure' => $avgBPChildren,
        'avg_heart_rate' => $avgHeartRateChildren
    ],
    'senior' => [
        'total' => $totalSenior,
        'male' => $totalMaleSenior,
        'female' => $totalFemaleSenior,
        'avg_weight' => $avgWeightSenior,
        'avg_height' => $avgHeightSenior,
        'avg_blood_pressure' => $avgBPSenior,
        'avg_heart_rate' => $avgHeartRateSenior
    ],
    'pregnant' => $pregnantData,
    'disease' => $diseaseData,
    'immunization' => $immunizationData
]);
?>
