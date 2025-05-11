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

// Get the category from the request
$category = isset($data['category']) ? $data['category'] : 'purok';


switch ($category) {
    case 'purok':
        $query = "
            SELECT purok AS label, COUNT(*) AS count 
            FROM patient 
            WHERE is_deleted != 'true' 
            GROUP BY purok
        ";
        break;

    case 'pregnant':
        $query = "
            SELECT p.purok AS label, COUNT(*) AS count
            FROM pregnant pr
            INNER JOIN patient p ON pr.patient_id = p.patient_id
            WHERE p.is_deleted != 'true'
            GROUP BY p.purok
        ";
        break;

    case 'disease':
        $query = "
            SELECT p.purok AS label, COUNT(*) AS count
            FROM disease d
            INNER JOIN patient p ON d.patient_id = p.patient_id
            WHERE p.is_deleted != 'true'
            GROUP BY p.purok
        ";
        break;

    case 'children':
        $query = "
            SELECT purok AS label, COUNT(*) AS count 
            FROM patient 
            WHERE is_deleted != 'true' AND age < 18 
            GROUP BY purok
        ";
        break;

    default:
        echo json_encode(['error' => 'Invalid category']);
        exit();
}

$result = $conn->query($query);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'label' => $row['label'],
        'count' => (int)$row['count']
    ];
}

echo json_encode($data);
?>
