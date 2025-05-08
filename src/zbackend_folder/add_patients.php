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

// Handle image upload
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
    'philhealth_num', 'first_name', 'mid_name', 'last_name',
    'bdate', 'gender', 'purok', 'civil_status',
    'age', 'contact', 'blood_type', 'household', 'staff_id'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

$username = strtolower($data['first_name'] . "_" . $data['last_name']);

// Insert patient into DB
$sql = "INSERT INTO patient (
    philhealth_num, first_name, mid_name, last_name,
    bdate, gender, purok, civil_status,
    age, contact, blood_type, household,
    patient_image, is_deleted, date_created, last_updated, username
) VALUES (
    '{$data['philhealth_num']}', '{$data['first_name']}', '{$data['mid_name']}', '{$data['last_name']}',
    '{$data['bdate']}', '{$data['gender']}', '{$data['purok']}', '{$data['civil_status']}',
    '{$data['age']}', '{$data['contact']}', '{$data['blood_type']}', '{$data['household']}',
    '$imageName', 'false', NOW(), NOW(), '$username'
)";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $fullName = "{$data['first_name']} {$data['mid_name']} {$data['last_name']}";
    $description = "Inserted $fullName: age: {$data['age']}, bdate: {$data['bdate']}, purok: {$data['purok']}, civil_status: {$data['civil_status']}, contact: {$data['contact']}, bloodtype: {$data['blood_type']}, household: {$data['household']}.";
    $staffId = $data['staff_id'];

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Insert', '$description', 'patient', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check success here too

    echo json_encode(["message" => "Patient added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
