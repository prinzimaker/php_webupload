let userKey = '';
let filesToUpload = []; // [{file, relativePath}]

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const plusBtn = document.getElementById('upload-plus');
const submitBtn = document.getElementById('submit-upload');
const filesListDiv = document.getElementById('selected-files-list') || dropArea;

// --- KEY VERIFICATION ---
document.getElementById('verifica-key').addEventListener('click', function () {
    userKey = document.getElementById('user-key').value.trim();
    if (!/^[A-Fa-f0-9]{32}$/.test(userKey)) {
        document.getElementById('key-feedback').innerText = "Key non valida";
        return;
    }
    fetch('api_verify_key.php?key=' + encodeURIComponent(userKey))
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                document.getElementById('step-key').style.display = 'none';
                document.getElementById('step-upload').style.display = '';
                loadFilesList();
            } else {
                document.getElementById('key-feedback').innerText = "Key rifiutata";
            }
        })
        .catch(() => {
            document.getElementById('key-feedback').innerText = "Errore di connessione";
        });
});

// --- FILE PICKER [+] ---
// Solo file multipli (NO directory, NO cartelle)
plusBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.removeAttribute('webkitdirectory');
    fileInput.setAttribute('multiple', 'multiple');
    fileInput.click();
});

// --- FILES CHOSEN (from picker) ---
fileInput.addEventListener('change', function () {
    filesToUpload = [];
    let files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
        filesToUpload.push({ file: files[i], relativePath: files[i].name });
    }
    updateSelectedFilesList();
    updateSubmitBtn();
});

// --- DRAG & DROP SUPPORT (file e cartelle) ---
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault(); e.stopPropagation();
    dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault(); e.stopPropagation();
    dropArea.classList.remove('dragover');
});
dropArea.addEventListener('drop', async (e) => {
    e.preventDefault(); e.stopPropagation();
    dropArea.classList.remove('dragover');
    filesToUpload = [];
    let items = e.dataTransfer.items;
    let traversePromises = [];
    for (let i = 0; i < items.length; i++) {
        let entry = items[i].webkitGetAsEntry ? items[i].webkitGetAsEntry() : null;
        if (entry) {
            traversePromises.push(traverseFileTreeAsync(entry, ""));
        } else if (items[i].getAsFile) {
            let file = items[i].getAsFile();
            if (file) filesToUpload.push({ file, relativePath: file.name });
        }
    }
    await Promise.all(traversePromises);
    console.log('Dopo drop:', filesToUpload);  // <--- DEBUG QUI
    updateSelectedFilesList();
    updateSubmitBtn();
});

function traverseFileTreeAsync(item, path) {
    return new Promise((resolve) => {
        if (item.isFile) {
            item.file((file) => {
                filesToUpload.push({ file, relativePath: path + file.name });
                resolve();
            });
        } else if (item.isDirectory) {
            let dirReader = item.createReader();
            dirReader.readEntries((entries) => {
                let promises = [];
                for (let i = 0; i < entries.length; i++) {
                    promises.push(traverseFileTreeAsync(entries[i], path + item.name + "/"));
                }
                Promise.all(promises).then(resolve);
            });
        } else {
            resolve();
        }
    });
}

// --- AGGIORNA UI FILES SELEZIONATI ---
function updateSelectedFilesList() {
    let area = filesListDiv;
    if (!area) {
        area = document.createElement('div');
        area.id = 'selected-files-list';
        dropArea.appendChild(area);
    }
    area.innerHTML = '';
    if (filesToUpload.length) {
        let html = "<ul>";
        filesToUpload.forEach((obj) => {
            html += `<li title="${escapeHtml(obj.relativePath)}">${escapeHtml(obj.relativePath)} <span style="color:#999">(${formatSize(obj.file.size)})</span></li>`;
        });
        html += "</ul>";
        area.innerHTML = html;
    }
}
function updateSubmitBtn() {
    submitBtn.disabled = filesToUpload.length === 0;
}
function formatSize(size) {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
}

// --- UPLOAD MULTIPLO/BATCH ---
// NB: SOLO UN EVENTO submit!
document.getElementById('upload-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!filesToUpload.length) return;
    let csrfInput = document.querySelector('input[name="csrf_token"]');
    if (!csrfInput) {
        alert("Token CSRF mancante, ricarica la pagina.");
        return;
    }
    let progressBar = document.getElementById('progress-bar');
    let progressElem = document.getElementById('upload-progress');
    let progressText = document.getElementById('progress-text');
    let antivirusOverlay = document.getElementById('antivirus-overlay');
    let totalFiles = filesToUpload.length;
    let uploadedFiles = 0;
    let lastPercent = 0;

    for (let obj of filesToUpload) {
        // Check max size lato client (se disponibile)
        if (typeof window.PHP_MAX_SIZE !== "undefined" && obj.file.size > window.PHP_MAX_SIZE) {
            alert(`File ${obj.relativePath} troppo grande (${formatSize(obj.file.size)}). Limite: ${formatSize(window.PHP_MAX_SIZE)}`);
            continue;
        }

        progressBar.style.display = '';
        progressElem.value = lastPercent;
        antivirusOverlay.style.display = 'block';
        progressText.innerText = Math.round(lastPercent) + "%";

        let formData = new FormData();
        formData.append('file', obj.file);
        formData.append('relativePath', obj.relativePath);
        formData.append('key', userKey);
        formData.append('csrf_token', csrfInput ? csrfInput.value : '');

        await new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', 'upload.php', true);

            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    let percent = ((uploadedFiles + (e.loaded / e.total)) / totalFiles) * 100;
                    progressElem.value = percent;
                    progressText.innerText = Math.round(percent) + "%";
                    lastPercent = percent;
                }
            };

            xhr.onload = function () {
                antivirusOverlay.style.display = 'none';
                if (xhr.status === 200) {
                    let res;
                    try { res = JSON.parse(xhr.responseText); } catch (e) {
                        alert("Errore: Risposta non valida dal server.");
                        return resolve();
                    }
                    if (res.status === 'ok') {
                        // ok
                    } else if (res.error && res.error.toUpperCase().includes("VIRUS")) {
                        alert(`ATTENZIONE: Il file ${obj.relativePath} contiene un virus e non è stato caricato.`);
                    } else {
                        alert("Errore: " + (res.error || 'Errore sconosciuto'));
                    }
                } else {
                    alert("Errore server (" + xhr.status + ")");
                }
                uploadedFiles++;
                resolve();
            };
            xhr.onerror = function () {
                antivirusOverlay.style.display = 'none';
                alert("Errore di rete durante upload di " + obj.relativePath);
                uploadedFiles++;
                resolve();
            };
            xhr.send(formData);
        });
    }

    // Fine batch
    progressBar.style.display = 'none';
    antivirusOverlay.style.display = 'none';
    filesToUpload = [];
    fileInput.value = '';
    updateSelectedFilesList();
    updateSubmitBtn();
    document.getElementById('upload-form').reset();
    loadFilesList();
    document.getElementById('finish-upload').style.display = '';
});

// --- RENDER ALBERO FILES/CARTELLE ESISTENTI ---
function renderTree(tree, depth = 0) {
    if (!tree || !tree.length) return '';
    let html = '<ul>';
    for (const item of tree) {
        if (item.type === 'dir') {
            html += `<li>
                <span class="folder-label"><b>${escapeHtml(item.name)}</b></span>
                ${renderTree(item.children, depth + 1)}
            </li>`;
        } else if (item.type === 'file') {
            const fileClass = depth === 0 ? "file-label-root file-name" : "file-label file-name";
            html += `<li>
                <span class="${fileClass}" data-fullname="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
                ${item.description ? ' - ' + escapeHtml(item.description) : ''}
            </li>`;
        }
    }
    html += '</ul>';
    return html;
}

// --- FILE LIST ---
function loadFilesList() {
    fetch('list_files.php?key=' + encodeURIComponent(userKey))
        .then(res => res.json())
        .then(data => {
            document.getElementById('files-list').innerHTML =
                "<h4>File caricati:</h4><div class='files-tree'>" + renderTree(data.tree) + "</div>";
            document.getElementById('fnc-buttons').style.display = '';
        })
        .catch(() => {
            document.getElementById('files-list').innerHTML = "<span style='color:red'>Impossibile caricare la lista file</span>";
        });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
            "'": "&#39;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;"
        })[s];
    });
}

// Tooltip per nome file lungo
document.addEventListener('mouseover', function (e) {
    const el = e.target.closest('.file-name');
    if (el) showCustomTooltip(el, el.dataset.fullname, e);
});
document.addEventListener('mousemove', function (e) {
    if (window.__customTooltip) {
        window.__customTooltip.style.left = (e.pageX + 18) + 'px';
        window.__customTooltip.style.top = (e.pageY + 16) + 'px';
    }
});
document.addEventListener('mouseout', function (e) {
    const el = e.target.closest('.file-name');
    if (el && window.__customTooltip) {
        document.body.removeChild(window.__customTooltip);
        window.__customTooltip = null;
    }
});
function showCustomTooltip(ref, text, evt) {
    if (window.__customTooltip) return;
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerText = text;
    tooltip.style.position = 'absolute';
    tooltip.style.left = (evt.pageX + 18) + 'px';
    tooltip.style.top = (evt.pageY + 16) + 'px';
    tooltip.style.background = '#fff';
    tooltip.style.color = '#23272f';
    tooltip.style.border = '1px solid #3984ff';
    tooltip.style.padding = '5px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.boxShadow = '0 2px 12px #3984ff22';
    tooltip.style.whiteSpace = 'pre-line';
    tooltip.style.zIndex = 99999;
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);
    window.__customTooltip = tooltip;
}
