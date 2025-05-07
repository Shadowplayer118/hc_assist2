<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("db.php");

$data = json_decode(file_get_contents("php://input"), true);

if ($data === null) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input."]);
    exit;
}

$username = $data["username"];
$input = $data["passwordOrPhilhealth"];

// === STAFF LOGIN CHECK ===
$stmt = $conn->prepare("SELECT * FROM staff WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if ($input === $row["password"]) {
        // ✅ Record staff login in audit_trail
        $userId = $row["staff_id"];
        $fullName = $row["first_name"] . " " . $row["last_name"];
        $description = "$fullName logged in.";
        $userType = "Auth"; // or $row["position"] if needed
        $action = "Login";

        $auditStmt = $conn->prepare("INSERT INTO audit_trail (user_id, action, description, target_table, date_recorded, user_type) VALUES (?, ?, ?, 'staff', NOW(), ?)");
        $auditStmt->bind_param("isss", $userId, $action, $description, $userType);
        $auditStmt->execute();

        echo json_encode([
            "success" => true,
            "role" => $row["position"],
            "user" => [
                "staff_id" => $row["staff_id"],
                "first_name" => $row["first_name"],
                "mid_name" => $row["mid_name"],
                "last_name" => $row["last_name"]
            ]
        ]);
        exit;
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
        exit;
    }
}

// === PATIENT LOGIN CHECK ===
$stmt = $conn->prepare("SELECT * FROM patient WHERE username = ? AND philhealth_num = ?");
$stmt->bind_param("ss", $username, $input);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // ✅ Record patient login in audit_trail
    $userId = $row["patient_id"];
    $fullName = $row["first_name"] . " " . $row["last_name"];
    $description = "$fullName logged in.";
    $userType = "Patient";
    $action = "Login";

    $auditStmt = $conn->prepare("INSERT INTO audit_trail (user_id, action, description, target_table, date_recorded, user_type) VALUES (?, ?, ?, 'patient', NOW(), ?)");
    $auditStmt->bind_param("isss", $userId, $action, $description, $userType);
    $auditStmt->execute();

    echo json_encode([
        "success" => true,
        "role" => "patient",
        "user" => [
            "patient_id" => $row["patient_id"],
            "first_name" => $row["first_name"],
            "mid_name" => $row["mid_name"],
            "last_name" => $row["last_name"]
        ]
    ]);
    exit;
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials."]);
}
?>
