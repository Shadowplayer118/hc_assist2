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

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . "/uploads/Staff_Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle staff image upload
$imageName = null;
if (isset($_FILES['staff_image']) && $_FILES['staff_image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['staff_image']['tmp_name'];
    $fileName = $_FILES['staff_image']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $timestamp = date('Ymd_His');
    $randomDigits = rand(100000, 999999);
    $newFileName = "StaffImg_" . $timestamp . "_" . $randomDigits . "." . $fileExtension;
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
    'first_name', 'mid_name', 'last_name', 'bdate',
    'gender', 'purok_assigned', 'civil_status', 'age',
    'contact', 'position', 'password', 'gmail'
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

$username = strtolower($data['first_name'] . "_" . $data['last_name']);

// Insert into staff table
$sql = "INSERT INTO staff (
    first_name, mid_name, last_name, bdate,
    gender, purok_assigned, civil_status, age,
    contact, position, password, username,
    staff_image, is_deleted, date_created, last_updated, gmail
) VALUES (
    '{$data['first_name']}', '{$data['mid_name']}', '{$data['last_name']}', '{$data['bdate']}',
    '{$data['gender']}', '{$data['purok_assigned']}', '{$data['civil_status']}', '{$data['age']}',
    '{$data['contact']}', '{$data['position']}', '{$data['password']}', '$username',
    '$imageName', 'false', NOW(), NOW(), '{$data['gmail']}'
)";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $fullName = "{$data['first_name']} {$data['mid_name']} {$data['last_name']}";
    $description = "Inserted new staff: $fullName, age: {$data['age']}, bdate: {$data['bdate']}, purok: {$data['purok_assigned']}, contact: {$data['contact']}, position: {$data['position']}.";
    
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        'SYSTEM', 'Insert', '$description', 'staff', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // optional error check

    echo json_encode(["message" => "Staff added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
