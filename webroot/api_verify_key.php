<?php
header('Content-Type: application/json');
$key = $_GET['key'] ?? '';
if (!preg_match('/^[A-Fa-f0-9]{32}$/', $key)) {
    echo json_encode(['status' => 'error', 'error' => 'Invalid key']);
    exit;
}

// Esempio: chiamata API esterna (curl)
//$apiUrl = "https://api.tuoserver.com/verify_key?key=" . urlencode($key);
//$response = file_get_contents($apiUrl);
//$data = json_decode($response, true);

$accepted = true; 

if ($accepted)
    die(json_encode(['status' => 'ok']));

die(json_encode(['status' => 'refused']));

