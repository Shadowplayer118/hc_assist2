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
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

$query = "
    SELECT m.item_name, m.brand, m.units, em.exp_date, em.stocked_in
    FROM expired_meds em
    JOIN meds m ON em.meds_id = m.meds_id
    WHERE em.action_taken = 'none'
    AND em.exp_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
";
$stmt = $conn->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

$medsData = [];

while ($row = $result->fetch_assoc()) {
    $medsData[] = $row;
}

if (count($medsData) === 0) {
    echo json_encode(['status' => 'success', 'message' => 'No expiring meds found within 7 days. No email sent.']);
    exit();
}

$query = "SELECT gmail FROM staff WHERE gmail LIKE '%@gmail.com%'";
$stmt = $conn->prepare($query);
$stmt->execute();
$emails = $stmt->get_result();

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'crmchs.malinao.dhaniel@gmail.com';
    $mail->Password = 'bsxy vcnj lmys pydj';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->setFrom('crmchs.malinao.dhaniel@gmail.com', 'Dhaniel');
    $mail->isHTML(true);
    $mail->Subject = '⚠️ Expiring Medicines Notification';

    $body = "<p>The following medicines will expire within 7 days and require attention:</p><table border='1' cellpadding='5' cellspacing='0'><tr><th>Item Name</th><th>Brand</th><th>Units</th><th>Expiry Date</th><th>Stocked In</th></tr>";
    foreach ($medsData as $med) {
        $body .= "<tr>
            <td>{$med['item_name']}</td>
            <td>{$med['brand']}</td>
            <td>{$med['units']}</td>
            <td>{$med['exp_date']}</td>
            <td>{$med['stocked_in']}</td>
        </tr>";
    }
    $body .= "</table>";

    $mail->Body = $body;

    foreach ($emails as $email) {
        $mail->addAddress($email['gmail']);
        $mail->send();
        $mail->clearAddresses();
    }

    echo json_encode(['status' => 'success', 'message' => 'Expiring meds notification sent to staff Gmail accounts.']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
}
?>
