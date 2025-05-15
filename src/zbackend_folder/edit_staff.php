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

// Create upload directory if not exists
$uploadDir = __DIR__ . "/uploads/Staff_Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

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

// Sanitize and collect input
$fields = [
    'staff_id', 'first_name', 'mid_name', 'last_name',
    'bdate', 'gender', 'purok_assigned', 'civil_status',
    'age', 'contact', 'position', 'password', 'gmail' // Added gmail
];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Format names
$data['first_name'] = ucfirst(strtolower($data['first_name']));
$data['mid_name'] = ucfirst(strtolower($data['mid_name']));
$data['last_name'] = ucfirst(strtolower($data['last_name']));

// Prepare optional updates
$passwordUpdate = '';
if (isset($_POST['password']) && trim($_POST['password']) !== '') {
    $data['password'] = $conn->real_escape_string($_POST['password']);
    $passwordUpdate = ", password = '{$data['password']}'";
}

$imageUpdate = '';
if (!is_null($imageName)) {
    $imageUpdate = ", staff_image = '{$imageName}'";
}

// Update staff
$sql = "UPDATE staff SET
    first_name = '{$data['first_name']}',
    mid_name = '{$data['mid_name']}',
    last_name = '{$data['last_name']}',
    bdate = '{$data['bdate']}',
    gender = '{$data['gender']}',
    purok_assigned = '{$data['purok_assigned']}',
    civil_status = '{$data['civil_status']}',
    age = '{$data['age']}',
    contact = '{$data['contact']}',
    position = '{$data['position']}',
    gmail = '{$data['gmail']}',
    last_updated = NOW()";

$sql .= $imageUpdate;
$sql .= $passwordUpdate;

$sql .= " WHERE staff_id = '{$data['staff_id']}'";

if ($conn->query($sql)) {
    // ✅ Log to audit trail
    $fullName = "{$data['first_name']} {$data['mid_name']} {$data['last_name']}";
    $description = "Edited $fullName: bdate: {$data['bdate']}, gender: {$data['gender']}, purok: {$data['purok_assigned']}, civil_status: {$data['civil_status']}, contact: {$data['contact']}, position: {$data['position']}.";

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '{$data['staff_id']}', 'Update', '$description', 'staff', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optional error check

    echo json_encode(["message" => "Staff updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
