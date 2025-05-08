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

// Create upload directory for medicine images
$uploadDir = __DIR__ . "/uploads/Med_Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle image upload (optional)
$imageName = null;
if (isset($_FILES['med_image']) && $_FILES['med_image']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['med_image']['tmp_name'];
    $fileName = $_FILES['med_image']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $timestamp = date('Ymd_His');
    $randomDigits = rand(100000, 999999);
    $newFileName = "MedImg_" . $timestamp . "_" . $randomDigits . "." . $fileExtension;
    $destination = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmpPath, $destination)) {
        $imageName = $newFileName;
    } else {
        echo json_encode(["error" => "Failed to save uploaded image."]);
        exit;
    }
}

// Sanitize inputs
$fields = ['meds_id', 'item_name', 'brand', 'category', 'units', 'price', 'staff_id', 'price'];

$data = [];
foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

$meds_id = $data['meds_id'];

// Build the UPDATE query
$sql = "UPDATE meds SET 
    item_name = '{$data['item_name']}',
    brand = '{$data['brand']}',
    category = '{$data['category']}',
    units = '{$data['units']}',
    price = '{$data['price']}',
    last_updated = NOW()";

if ($imageName) {
    $sql .= ", med_image = '$imageName'";
}

$sql .= " WHERE meds_id = '$meds_id'";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Updated medicine: {$data['item_name']}, brand: {$data['brand']}, category: {$data['category']}, units: {$data['units']}, price: {$data['price']}.";
    $staffId = $data['staff_id'];

    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '$staffId', 'Update', '$description', 'medicines', NOW(), 'Admin'
    )";

    $conn->query($auditSql);

    echo json_encode(["message" => "Medicine updated successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
