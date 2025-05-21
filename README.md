# PHP WebUploader

**PHP WebUploader** is a simple yet robust multi-file uploader built using pure PHP, HTML5, JavaScript, and CSS3—**without any third-party libraries**.  
Designed with security and usability in mind, it enables users to upload single files, multiple files, or even entire directories with a modern drag-and-drop interface.

## Features

- **No dependencies:** 100% pure PHP (server-side), vanilla HTML5/JS/CSS3 (client-side).  
  No frameworks or external libraries required.
- **Multi-file and directory upload:**  
  Drag and drop multiple files or entire folders directly into the browser.
- **Strict file type control:**  
  Only authorized file types are accepted. If you select multiple files, only the allowed types will be uploaded; the others will be ignored.
- **Antivirus scan:**  
  Every single uploaded file is scanned with an antivirus before being stored.  
  If a file is found to be infected, it is immediately deleted.
- **Filename sanitization:**  
  All file names are cleaned to prevent injection and path traversal issues.
- **Private storage:**  
  Uploaded files are **never accessible from the internet**—the upload directory is completely isolated from the public web.
- **Access key security:**  
  File access and uploads are protected by a unique, randomly generated 32-byte hexadecimal key.  
  Each key corresponds to a private folder for that upload session.
- **Security-first:**  
  Files are not publicly exposed, reducing risk of unauthorized downloads or data leaks.

## Quick Start

1. Clone or download this repository.
2. Copy the files to your web server.
3. Make sure your PHP process can write to the upload directory.
4. Open the upload page in your browser.
5. Enter your 32-byte hexadecimal access key.
6. Drag and drop your files or folders to start uploading.
7. Only allowed files will be uploaded. Each file is scanned by antivirus before being accepted.

## Security Notes

- **Files are stored in private directories and cannot be accessed over the web.**
- **Each upload session is protected by a strong, random access key.**
- **All files are sanitized and scanned for malware before storage.**

## License

This project is released under the MIT License.

---

**Contributions and feedback are welcome!**

