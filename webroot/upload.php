<?php
// ...VALIDAZIONE CHIAVE, CREAZIONE DIR, LOG DIR, ecc
function parse_filesize($size) {
    $size = trim($size);
    $last = strtolower($size[strlen($size)-1]);
    $num = floatval($size);
    switch($last) {
        case 'g': $num *= 1024;
        case 'm': $num *= 1024;
        case 'k': $num *= 1024;
    }
    return (int)$num;
}
$php_upload = parse_filesize(ini_get('upload_max_filesize'));
$php_post   = parse_filesize(ini_get('post_max_size'));
$max_size   = min($php_upload, $php_post);


// Carica la lista estensioni accettate
$envContent = file_get_contents(__DIR__ . '/../accept_extensions.env');
preg_match('/TYPES_ACCEPTED\s*=\s*(\[[^\]]+\])/', $envContent, $matches);
$accepted_extensions = json_decode($matches[1], true);

// Carica la lista dei mime types estesi da JSON
$ext_to_mime = json_decode(file_get_contents(__DIR__ . '/../mime_types.json'), true);

// Genera la lista di mime consentiti solo per le estensioni attive
$allowed_mimetypes = [];
foreach ($accepted_extensions as $ext) {
    if (isset($ext_to_mime[$ext])) {
        $allowed_mimetypes[$ext_to_mime[$ext]] = $ext;
    }
}

// 4. Validazione file
$file = $_FILES['file'] ?? null;
if (!$file) {
    die(json_encode(['status' => 'error', 'error' => 'Nessun file ricevuto']));
}
$filename = $file['name'];
$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
$mime = mime_content_type($file['tmp_name']);

if (!in_array($extension, $accepted_extensions) || !in_array($mime, array_keys($allowed_mimetypes))) {
    die(json_encode(['status' => 'error', 'error' => "Tipo di file non accettato ($extension, $mime)"]));
}

// --- FILE UPLOAD ---
$file = $_FILES['file'] ?? null;
$relativePath = $_POST['relativePath'] ?? ($file ? $file['name'] : '');

if (!$file || $file['error'] != UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'error' => 'Errore nell\'upload del file']);
    exit;
}
if ($file['size'] > $max_size) {
    echo json_encode(['status' => 'error', 'error' => 'File troppo grande. Max ' . round($max_size/(1024*1024),2) . ' MB']);
    exit;
}
if (!array_key_exists($file['type'], $allowed_mimetypes)) {
    echo json_encode(['status' => 'error', 'error' => 'Tipo file non ammesso']);
    exit;
}

// Pulizia percorso
$relativePath = preg_replace('/[^\w\-\.\/]/', '_', $relativePath);
$relativePath = preg_replace('/\/+/', '/', $relativePath); // niente doppie //
if (strpos($relativePath, '..') !== false) {
    echo json_encode(['status' => 'error', 'error' => 'Nome file non valido']);
    exit;
}

$key = $_POST['key'] ?? '';
$upload_base = realpath(__DIR__ . "/../uploads");
$upload_dir  = $upload_base . "/" . $key;

// Ricostruisci la struttura della cartella
$finalPath = $upload_dir . "/" . dirname($relativePath);
if (!is_dir($finalPath)) mkdir($finalPath, 0775, true);

// Percorso file finale
$safeName = basename($relativePath);
$target = $finalPath . "/" . $safeName;

// Sposta il file
if (!move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode(['status' => 'error', 'error' => 'Errore nel salvataggio']);
    exit;
}
chmod($target, 0664);

// Antivirus (clamdscan, opzionale)
if (file_exists($target) && is_file($target)) {
    exec("clamdscan --no-summary " . escapeshellarg($target), $output, $virusFound);
    if ($virusFound !== 0) {
        unlink($target);
        echo json_encode(['status' => 'error', 'error' => 'Il file era infetto ed è stato eliminato!']);
        exit;
    }
}

echo json_encode(['status' => 'ok']);
exit;
