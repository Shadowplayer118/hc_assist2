<?php
// CORS headers
header("Access-Control-Allow-Origin: *"); // Allow all origins (adjust to a specific origin in production)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../../db.php");  // Adjust the path if needed

// Get the filter data from the frontend
$data = json_decode(file_get_contents("php://input"), true);

// Initialize the query and parameters
$query = "SELECT * FROM patient WHERE is_deleted != 'true'"; 
$params = [];
$types = "";

// Search by name (first_name, mid_name, or last_name)
if (!empty($data['name'])) {
    $query .= " AND (first_name LIKE ? OR mid_name LIKE ? OR last_name LIKE ?)";
    $name = "%" . $data['name'] . "%";
    $params[] = $name;
    $params[] = $name;
    $params[] = $name;
    $types .= "sss"; // Three string parameters
}

// Filter by blood type
if (!empty($data['blood_type'])) {
    $query .= " AND blood_type = ?";
    $params[] = $data['blood_type'];
    $types .= "s"; // One string parameter
}

// Filter by age
if (!empty($data['age'])) {
    $query .= " AND age = ?";
    $params[] = $data['age'];
    $types .= "i"; // One integer parameter
}

// Prepare and execute the query
$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// Collect the results
$patients = [];
while ($row = $result->fetch_assoc()) {
    $patients[] = $row;
}

// Return the filtered results as JSON
echo json_encode($patients);
?>
