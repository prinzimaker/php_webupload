<?php
header('Content-Type: application/json');
$key = $_GET['key'] ?? '';
if (!preg_match('/^[A-Fa-f0-9]{32}$/', $key)) {
    echo json_encode(['tree' => []]);
    exit;
}
$base_dir = realpath(__DIR__ . "/../uploads/$key");

function scanDirTree($dir) {
    $result = [];
    $entries = scandir($dir);
    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') continue;
        $fullpath = "$dir/$entry";
        if (is_dir($fullpath)) {
            // Cartella: ricorsione
            $result[] = [
                'type' => 'dir',
                'name' => $entry,
                'children' => scanDirTree($fullpath)
            ];
        } elseif (is_file($fullpath)) {
            // File: info
            $descfile = $fullpath . ".desc.txt";
            $desc = file_exists($descfile) ? file_get_contents($descfile) : '';
            // Escludi eventuali file .desc.txt dalla visualizzazione principale
            if (substr($entry, -9) === '.desc.txt') continue;
            $result[] = [
                'type' => 'file',
                'name' => $entry,
                'size' => filesize($fullpath),
                'mtime' => date('Y-m-d H:i:s', filemtime($fullpath)),
                'description' => $desc
            ];
        }
    }
    return $result;
}

$tree = [];
if ($base_dir && is_dir($base_dir)) {
    $tree = scanDirTree($base_dir);
}

echo json_encode(['tree' => $tree]);
