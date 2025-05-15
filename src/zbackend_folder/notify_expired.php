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

// Select expired meds that haven't been viewed
$query = "
    SELECT m.item_name, m.brand, m.units, em.exp_date, em.stocked_in
    FROM expired_meds em
    JOIN meds m ON em.meds_id = m.meds_id
    WHERE em.action_taken = 'none'
    AND em.exp_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    AND em.is_viewed = 'false'
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

// Fetch staff Gmail accounts
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

    // Build the email body with improved design
    $body = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border-left: 1px solid #dddddd;
            border-right: 1px solid #dddddd;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 15px 20px;
            font-size: 12px;
            color: #6c757d;
            border-radius: 0 0 5px 5px;
            border: 1px solid #dddddd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #f2f2f2;
            padding: 10px;
            text-align: left;
            border: 1px solid #dddddd;
        }
        td {
            padding: 10px;
            border: 1px solid #dddddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .warning-icon {
            font-size: 20px;
            margin-right: 10px;
        }
        .action-needed {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px 15px;
            margin-bottom: 20px;
        }
        .expiring-soon {
            color: #e74c3c;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'><span class='warning-icon'>⚠️</span> Expiring Medicines Alert</h2>
        </div>
        <div class='content'>
            <div class='action-needed'>
                <p><strong>Action Required:</strong> The following medicines have expired or will expire within 7 days and need your attention.</p>
            </div>
            
            <p>Please review the items below and take appropriate action (dispose, use, or redistribute) before they expire:</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Brand</th>
                        <th>Units</th>
                        <th>Expiry Date</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>";

    // Add each medicine to the table with conditional formatting
    foreach ($medsData as $med) {
        // Calculate days until expiration
        $expDate = new DateTime($med['exp_date']);
        $today = new DateTime();
        $daysRemaining = $today->diff($expDate)->days;
        
        // Apply special class for items that are expired or expiring soon
        $rowClass = "";
        if ($daysRemaining <= 0) {
            $rowClass = "class='expired'";
        } elseif ($daysRemaining <= 3) {
            $rowClass = "class='expiring-soon'";
        }
        
        $body .= "<tr $rowClass>
            <td><strong>{$med['item_name']}</strong></td>
            <td>{$med['brand']}</td>
            <td>{$med['units']}</td>
            <td>" . date('M d, Y', strtotime($med['exp_date'])) . "</td>
            <td>{$med['stocked_in']}</td>
        </tr>";
    }

    $body .= "
                </tbody>
            </table>
            
            <p><strong>Reminder:</strong> Please update the system after taking action on these items.</p>
        </div>
        <div class='footer'>
            <p>This is an automated notification from the Medication Management System.</p>
            <p>If you have questions, please contact the pharmacy administrator.</p>
        </div>
    </div>
</body>
</html>
";

    $mail->Body = $body;
    
    // Create a plain text version for email clients that don't support HTML
    $mail->AltBody = "EXPIRING MEDICINES ALERT\n\n";
    $mail->AltBody .= "The following medicines will expire within 7 days and require attention:\n\n";

    foreach ($medsData as $med) {
        $mail->AltBody .= "- {$med['item_name']} ({$med['brand']}): {$med['units']} units, expires on {$med['exp_date']}, located in {$med['stocked_in']}\n";
    }

    $mail->AltBody .= "\nPlease take appropriate action on these items as soon as possible.";

    // Send email to all Gmail staff
    foreach ($emails as $email) {
        $mail->addAddress($email['gmail']);
        $mail->send();
        $mail->clearAddresses();
    }

    // Mark notified expired meds as viewed
    $updateQuery = "
        UPDATE expired_meds
        SET is_viewed = 'true'
        WHERE action_taken = 'none'
        AND exp_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND is_viewed = 'false'
    ";
    $conn->query($updateQuery);

    echo json_encode(['status' => 'success', 'message' => 'Expiring meds notification sent to staff Gmail accounts.']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
}
?>