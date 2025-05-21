# PHP WebUploader

**PHP WebUploader** è un uploader multi-file semplice ma robusto, sviluppato utilizzando solo PHP puro, HTML5, JavaScript e CSS3 — **senza alcuna libreria di terze parti**.  
Progettato con un occhio di riguardo a sicurezza e semplicità d’uso, consente agli utenti di caricare file singoli, multipli o intere cartelle tramite una moderna interfaccia drag-and-drop.

## Caratteristiche

- **Nessuna dipendenza:** 100% PHP puro (lato server), HTML5/JS/CSS3 vanilla (lato client).  
  Nessun framework o libreria esterna richiesta.
- **Upload multiplo e directory:**  
  Trascina e rilascia più file o intere cartelle direttamente nel browser.
- **Controllo rigoroso dei tipi di file:**  
  Sono accettati solo i tipi di file autorizzati. Se selezioni più file, verranno caricati solo quelli ammessi; gli altri saranno ignorati.
- **Scansione antivirus:**  
  Ogni singolo file caricato viene scansionato da un antivirus prima di essere salvato.  
  Se un file viene rilevato come infetto, viene immediatamente eliminato.
- **Sanificazione dei nomi dei file:**  
  Tutti i nomi dei file vengono ripuliti per prevenire problemi di injection o path traversal.
- **Storage privato:**  
  I file caricati **non sono mai accessibili da internet** — la cartella di upload è completamente isolata dal web pubblico.
- **Accesso protetto da chiave:**  
  L’accesso e il caricamento dei file sono protetti da una chiave esadecimale unica di 32 byte, generata casualmente.  
  Ogni chiave corrisponde a una cartella privata per quella sessione di upload.
- **Massima sicurezza:**  
  I file non vengono mai esposti pubblicamente, riducendo il rischio di download non autorizzati o fughe di dati.

## Solo i file autorizzati verranno caricati. Ogni file è sottoposto a scansione antivirus prima di essere accettato.
### Gestione delle estensioni accettate e verifica MIME type

La lista delle estensioni di file accettate è definita nel file `accepted_extensions.env`.  
Per ogni estensione elencata, l'applicazione recupera il relativo MIME type dal file `mime_types.json`.  
**Se per una determinata estensione non esiste una corrispondenza nel file JSON, il file non verrà riconosciuto come valido** e quindi non potrà essere caricato: in tal caso, occorre aggiornare anche `mime_types.json` con il MIME type corretto.

## Antivirus

L'applicazione utilizza **ClamAV** come sistema di controllo antivirus per tutti i file caricati.  
**Questa scelta non è attualmente configurabile**: ogni file viene automaticamente scansionato con ClamAV prima di essere accettato.


## Guida Rapida

1. Clona o scarica questo repository.
2. Copia i file sul tuo web server.
3. Configura Apache/Nginx affinché la directory "webroot" sia la root della tua applicazione web.
4. Apri la pagina index nel browser.
5. Inserisci una chiave esadecimale di 32 byte a tua scelta (non viene fatta alcuna verifica, la responsabilità è tua).
6. Trascina e rilascia i tuoi file o cartelle per iniziare il caricamento.
7. Troverai i file nella directory upload, allo stesso livello della webroot.

      
      root
      
      [config files]
      
      > upload
      
          [key folder]
      
              [upload files]
      
      > log
      
          [operations logger]
      
      > webroot (this is teh web server application folder)
      
          [the app files]


## Note sulla Sicurezza

- **I file sono memorizzati in directory private e non possono essere accessibili dal web.**
- **Ogni sessione di upload è protetta da una chiave di accesso forte e casuale.**
- **Tutti i file vengono sanificati e sottoposti a scansione antivirus prima della memorizzazione.**

## Licenza

Questo progetto è distribuito con licenza MIT.

---

**Contributi e feedback sono benvenuti!**
