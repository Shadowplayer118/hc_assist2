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

// Create upload directory if needed
$uploadDir = __DIR__ . "/uploads/Patient_Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle image upload (optional)
$imageName = null;
if (isset($_FILES['patient_image']) && $_FILES['patient_image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['patient_image']['tmp_name'];
    $fileName = $_FILES['patient_image']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $timestamp = date('Ymd_His');
    $randomDigits = rand(100000, 999999);
    $newFileName = "PatientImg_" . $timestamp . "_" . $randomDigits . "." . $fileExtension;
    $destination = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmpPath, $destination)) {
        $imageName = $newFileName;
    } else {
        echo json_encode(["error" => "Failed to save uploaded image."]);
        exit;
    }
}

// Sanitize inputs
$fields = [
    'patient_id', 'philhealth_num', 'first_name', 'mid_name', 'last_name',
    'bdate', 'gender', 'purok', 'civil_status',
    'age', 'contact', 'blood_type', 'household', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

$username = strtolower($data['first_name'] . "_" . $data['last_name']);
$patient_id = $data['patient_id'];

// Build the UPDATE query
$sql = "UPDATE patient SET 
    philhealth_num = '{$data['philhealth_num']}',
    first_name = '{$data['first_name']}',
    mid_name = '{$data['mid_name']}',
    last_name = '{$data['last_name']}',
    bdate = '{$data['bdate']}',
    gender = '{$data['gender']}',
    purok = '{$data['purok']}',
    civil_status = '{$data['civil_status']}',
    age = '{$data['age']}',
    contact = '{$data['contact']}',
    blood_type = '{$data['blood_type']}',
    household = '{$data['household']}',
    username = '$username',
    last_updated = NOW()";

// If a new image was uploaded, add it to the SQL query
if ($imageName) {
    $sql .= ", patient_image = '$imageName'";
}

$sql .= " WHERE patient_id = '$patient_id'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $fullName = "{$data['first_name']} {$data['mid_name']} {$data['last_name']}";
    $description = "Updated $fullName: age: {$data['age']}, bdate: {$data['bdate']}, purok: {$data['purok']}, civil_status: {$data['civil_status']}, contact: {$data['contact']}, bloodtype: {$data['blood_type']}, household: {$data['household']}.";

    $staffId = $data['staff_id'];
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'patient', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check success here too

    echo json_encode(["message" => "Patient updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
