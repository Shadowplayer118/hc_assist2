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

// Sanitize and fetch inputs
$fields = ['activity_type', 'units', 'date', 'expiration_date', 'meds_id', 'staff_id'];
$data = [];

foreach ($fields as $field) {
    $data[$field] = isset($_POST[$field]) ? $conn->real_escape_string($_POST[$field]) : '';
}

// Validate required fields
if (empty($data['activity_type']) || empty($data['units']) || empty($data['date']) || empty($data['meds_id']) || empty($data['staff_id'])) {
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

$activity = $data['activity_type'];
$units = intval($data['units']);
$meds_id = intval($data['meds_id']);
$expiration = $data['expiration_date'] ?: null;
$date = $data['date'];
$staff_id = $data['staff_id'];

// Fetch item name for audit log
$itemName = "";
$result = $conn->query("SELECT item_name FROM meds WHERE meds_id = '$meds_id'");
if ($row = $result->fetch_assoc()) {
    $itemName = $row['item_name'];
}

if ($activity === 'stock-in') {
    // 1. Update meds units
    $update = "UPDATE meds SET units = units + $units WHERE meds_id = '$meds_id'";
    if (!$conn->query($update)) {
        echo json_encode(["error" => "Failed to stock in: " . $conn->error]);
        exit;
    }

    // 2. Insert into expired_meds
    $insert = "INSERT INTO expired_meds (meds_id, exp_date, stocked_in, action_taken, is_viewed)
               VALUES ('$meds_id', " . ($expiration ? "'$expiration'" : "NULL") . ", '$units', 'none', 'false')";
    $conn->query($insert); // optional, don't exit on failure

    // 3. Audit log
    $desc = "Stocked in $units unit(s) of $itemName (ID: $meds_id).";
    $audit = "INSERT INTO audit_trail (user_id, action, description, target_table, date_recorded, user_type)
              VALUES ('$staff_id', 'Stock In', '$desc', 'medicines', NOW(), 'Admin')";
    $conn->query($audit);

    echo json_encode(["message" => "Stock-in successful."]);

} elseif ($activity === 'stock-out') {
    // Check current units
    $check = $conn->query("SELECT units FROM meds WHERE meds_id = '$meds_id'");
    $row = $check->fetch_assoc();
    if (!$row || $row['units'] < $units) {
        echo json_encode(["error" => "Insufficient stock."]);
        exit;
    }

    // 1. Update meds units
    $update = "UPDATE meds SET units = units - $units WHERE meds_id = '$meds_id'";
    if (!$conn->query($update)) {
        echo json_encode(["error" => "Failed to stock out: " . $conn->error]);
        exit;
    }

    // 2. Audit log
    $desc = "Stocked out $units unit(s) of $itemName (ID: $meds_id).";
    $audit = "INSERT INTO audit_trail (user_id, action, description, target_table, date_recorded, user_type)
              VALUES ('$staff_id', 'Stock Out', '$desc', 'medicines', NOW(), 'Admin')";
    $conn->query($audit);

    echo json_encode(["message" => "Stock-out successful."]);

} else {
    echo json_encode(["error" => "Invalid activity type."]);
}

$conn->close();
?>