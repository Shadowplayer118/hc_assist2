<?php
$host = "localhost";
$user = "root";          // replace with your DB user
$pass = "";              // replace with your DB password
$dbname = "hc_assist_db2"; // replace with your DB name

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
