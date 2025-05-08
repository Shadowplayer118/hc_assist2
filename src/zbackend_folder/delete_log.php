<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../db.php");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data)) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit();
}

// Delete by ID
if (!empty($data['audit_id'])) {
    $id = intval($data['audit_id']);
    $conn->query("DELETE FROM audit_trail WHERE audit_id = $id");
    echo json_encode(['success' => true]);
    exit();
}

// Delete by filters
$where = "1=1";
if (!empty($data['date'])) {
    $where .= " AND DATE(date_recorded) = '" . $conn->real_escape_string($data['date']) . "'";
}
if (!empty($data['user'])) {
    $search = $conn->real_escape_string($data['user']);
    $where .= " AND (
        user_id IN (
            SELECT staff_id FROM staff WHERE CONCAT(first_name, ' ', last_name) LIKE '%$search%'
            UNION
            SELECT patient_id FROM patient WHERE CONCAT(first_name, ' ', last_name) LIKE '%$search%'
        )
    )";
}
if (!empty($data['action'])) {
    $where .= " AND action LIKE '%" . $conn->real_escape_string($data['action']) . "%'";
}
if (!empty($data['target_table'])) {
    $where .= " AND target_table LIKE '%" . $conn->real_escape_string($data['target_table']) . "%'";
}

$conn->query("DELETE FROM audit_trail WHERE $where");
echo json_encode(['success' => true]);
