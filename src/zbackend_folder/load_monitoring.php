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
$range = isset($data['range']) ? $data['range'] : 'today';

$whereClause = "";

switch ($range) {
    case 'today':
        $whereClause = "DATE(s.sched_date) = CURDATE()";
        break;
    case 'week':
        $whereClause = "YEARWEEK(s.sched_date, 1) = YEARWEEK(CURDATE(), 1)";
        break;
    case 'month':
        $whereClause = "MONTH(s.sched_date) = MONTH(CURDATE()) AND YEAR(s.sched_date) = YEAR(CURDATE())";
        break;
    default:
        echo json_encode(["error" => "Invalid range specified"]);
        exit();
}

$query = "
    SELECT 
        s.sched_id,
        s.sched_date,
        s.sched_type,
        s.status,
        s.activity,
        s.patient_id,
        p.first_name,
        p.last_name,
        p.patient_image
    FROM schedules s
    INNER JOIN patient p ON s.patient_id = p.patient_id
    WHERE $whereClause
      AND p.is_deleted != 'true'
    ORDER BY s.sched_date ASC
";

$result = $conn->query($query);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'sched_id' => $row['sched_id'],
        'sched_date' => $row['sched_date'],
        'sched_type' => $row['sched_type'],
        'status' => $row['status'],
        'activity' => $row['activity'],
        'patient_id' => $row['patient_id'],
        'first_name' => $row['first_name'],
        'last_name' => $row['last_name'],
        'patient_image' => $row['patient_image']
    ];
}

echo json_encode($data);
?>
