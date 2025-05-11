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

$query = "
    SELECT 
        s.sched_id,
        s.sched_type,
        s.status,
        s.sched_date,
        s.activity,
        p.patient_id,
        p.first_name,
        p.last_name,
        p.patient_image
    FROM schedules s
    LEFT JOIN patient p ON s.patient_id = p.patient_id
    WHERE status != 'cancelled'
";
$params = [];
$types = "";

// Optional filters
if (!empty($data['sched_type'])) {
    $query .= " AND s.sched_type = ?";
    $params[] = $data['sched_type'];
    $types .= "s";
}

if (!empty($data['status'])) {
    $query .= " AND s.status = ?";
    $params[] = $data['status'];
    $types .= "s";
}

if (!empty($data['sched_date'])) {
    $query .= " AND s.sched_date = ?";
    $params[] = $data['sched_date'];
    $types .= "s";
}

$query .= " ORDER BY s.sched_date DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$schedules = [];
$schedTypes = [];
$statuses = [];
$schedDates = [];

while ($row = $result->fetch_assoc()) {
    $schedules[] = $row;

    // Unique filter values
    if (!in_array($row['sched_type'], $schedTypes)) $schedTypes[] = $row['sched_type'];
    if (!in_array($row['status'], $statuses)) $statuses[] = $row['status'];
    if (!in_array($row['sched_date'], $schedDates)) $schedDates[] = $row['sched_date'];
}

echo json_encode([
    'schedules' => $schedules,
    'filters' => [
        'sched_types' => $schedTypes,
        'statuses' => $statuses,
        'sched_dates' => $schedDates,
    ]
]);
?>
