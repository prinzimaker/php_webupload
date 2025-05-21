<?php
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

// Ottieni i limiti reali da PHP per visualizzarli nell'interfaccia
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
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Upload Sicuro</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="step-key">
    <h2>Inserisci la tua key di accesso</h2>
    <input type="text" id="user-key" maxlength="32" pattern="[A-Fa-f0-9]{32}" placeholder="Key esadecimale 32 caratteri">
    <button id="verifica-key">Verifica</button>
    <div id="key-feedback"></div>
  </div>
  <div id="step-upload" style="display:none;">
    <div id="antivirus-overlay" style="display:none;">
        <div class="overlay-bg"></div>
        <div class="overlay-content">
            <div class="spinner"></div>
            <div class="overlay-text">Antivirus checking...</div>
        </div>
    </div>

    <h2>Carica i tuoi file o cartelle</h2>
    <div class="info-upload">Dimensione massima per file: <b><?php echo round($max_size/(1024*1024),2); ?> MB</b>. Puoi caricare anche intere cartelle.</div>
    <form id="upload-form" method="post" enctype="multipart/form-data" autocomplete="off">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrf_token, ENT_QUOTES); ?>">
        <!--
        <div style="margin-bottom:16px;">
            <label for="descrizione-input">Descrizione (opzionale, associata ai file):</label>
            <input type="text" name="descrizione" id="descrizione-input" placeholder="Descrizione (opzionale)">
        </div>
        -->
        <div id="drop-area" class="upload-area">
            <span class="file-label" id="file-label">
                Trascina qui file/cartelle.<br>Oppure premi <button type="button" class="upload-plus" id="upload-plus" tabindex="0" aria-label="Scegli un file">+</button>
            </span>
            <input type="file" id="file-input" style="display:none;" multiple>
        </div>


        <div id="selected-files-list"></div>
        <button type="submit" id="submit-upload" style="margin-top:12px;" disabled>Invia</button>
        <div id="fnc-buttons" style="display:none;margin-top:15px;">
            <button id="finish-upload" style="display:none;">OK, ho finito</button>
        </div>
    </form>
    <div id="progress-bar" style="display:none;">
        <progress id="upload-progress" value="0" max="100"></progress>
        <span id="progress-text">0%</span>
    </div>
    <div id="files-list"></div>
  </div>
  <script>
  // Passa il max_size (in bytes) a JS
  window.PHP_MAX_SIZE = <?php echo $max_size; ?>;
  </script>
  <script src="app.js"></script>
</body>
</html>
