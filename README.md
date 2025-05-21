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


## Only allowed files will be uploaded. Each file is scanned by antivirus before being accepted.
### Accepted Extensions and MIME Type Matching

The list of accepted file extensions is defined in the `accepted_extensions.env` file.  
For each listed extension, the application retrieves the corresponding MIME type from the `mime_types.json` file.  
**If an extension does not have a matching MIME type in the JSON file, that file type will not be recognized as valid** and will not be accepted: in such cases, you need to update the `mime_types.json` file with the correct MIME type.

## Antivirus

The application uses **ClamAV** as the antivirus engine for all uploaded files.  
**This is not configurable at the moment:** every uploaded file is automatically scanned with ClamAV before being accepted.

## Quick Start

1. Clone or download this repository.
2. Copy the files to your web server.
3. configura apache/nginx to the "webroot" directiry as your root web app directory
4. Open the index page in your browser.
5. Enter any 32-byte hexadecimal access key (no check is done, it's your duty).
6. Drag and drop your files or folders to start uploading.
7. You will find the files nder the upload dir ath the same level of webroot.
      
      root
      
      [config files]
      
      > upload
      
          [key folder]
      
              [upload files]
      
      > log
      
          [operations logger]
      
      > webroot (this is teh web server application folder)
      
          [the app files]

## Security Notes

- **Files are stored in private directories and cannot be accessed over the web.**
- **Each upload session is protected by a strong, random access key.**
- **All files are sanitized and scanned for malware before storage.**

## License

This project is released under the MIT License.

---

**Contributions and feedback are welcome!**

