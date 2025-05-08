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
$uploadDir = __DIR__ . "/uploads/Med_Images/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle image upload
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
$fields = ['item_name', 'category', 'brand', 'units', 'price'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Insert medicine into DB
$sql = "INSERT INTO meds (
    item_name, category, brand, units, price, med_image, is_deleted, date_recorded, last_updated
) VALUES (
    '{$data['item_name']}', '{$data['category']}', '{$data['brand']}',
    '{$data['units']}', '{$data['price']}', '$imageName', 'false', NOW(), NOW()
)";

if ($conn->query($sql)) {
    // ✅ Insert into audit_trail
    $description = "Inserted medicine: {$data['item_name']} ({$data['brand']}), category: {$data['category']}, units: {$data['units']}, price: {$data['price']}.";
    
    // Optional: Replace '1' with actual staff ID if available in your session or POST data
    $auditSql = "INSERT INTO audit_trail (
        user_id, action, description, target_table, date_recorded, user_type
    ) VALUES (
        '1', 'Insert', '$description', 'medicine', NOW(), 'Admin'
    )";

    $conn->query($auditSql); // Optionally check for success

    echo json_encode(["message" => "Medicine added successfully."]);
} else {
    echo json_encode(["error" => "Database error: " . $conn->error]);
}

$conn->close();
?>
