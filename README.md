# API Sniffer and DevTools Detection Bypass

## Overview

This script is designed to intercept API requests made via `XMLHttpRequest` and `fetch`, log their details to the browser's `localStorage`, and display those logs on page reload. Additionally, it implements a DevTools detection bypass and prevents page reloads to prevent disruption while inspecting the page. It also logs all actions to both the console and `localStorage`.

## Features

- **API Request Logging**: Logs both `XMLHttpRequest` and `fetch` requests, including method, URL, response status, and response data.
- **LocalStorage Logging**: All logs are stored in the browser's `localStorage` under the key `apiLogs`.
- **Persistent Logs on Page Reload**: Stored logs are displayed automatically when the page is reloaded.
- **DevTools Detection Bypass**: Disables common DevTools detection techniques to help prevent detection while inspecting the page.
- **Page Reload Prevention**: Prevents the page from being reloaded to allow uninterrupted inspection.

## Code Breakdown

### 1. **Log Output to Console and LocalStorage**
   The `logToStorage` function logs messages to both the browser console and `localStorage`.

   ```javascript
   const logToStorage = (message) => {
       console.log(message);
       const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
       logs.push(message);
       localStorage.setItem("apiLogs", JSON.stringify(logs));
   };
   ```

### 2. **Display Stored Logs on Page Reload**
   When the page is reloaded, previously stored logs are retrieved from `localStorage` and displayed.

   ```javascript
   const showStoredLogs = () => {
       const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
       logs.forEach(log => logToStorage(log));
   };
   ```

### 3. **API Request Logging (XMLHttpRequest)**
   Hooks into the `XMLHttpRequest` to log outgoing requests and responses.

   ```javascript
   const originalXHR = XMLHttpRequest.prototype.open;
   XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
       const message = `📡 API Detected:\nMethod: ${method}\nURL: ${url}`;
       logToStorage(message);
       this.addEventListener("load", function () {
           const responseMessage = `🛬 Response Status: ${this.status}\n🛠 Response Data: ${this.responseText}`;
           logToStorage(responseMessage);
       });
       return originalXHR.apply(this, arguments);
   };
   ```

### 4. **API Request Logging (Fetch API)**
   Hooks into the `fetch` API to log outgoing requests and responses.

   ```javascript
   const originalFetch = window.fetch;
   window.fetch = async function (...args) {
       const message = `📡 Fetch Detected:\nURL: ${args[0]}`;
       logToStorage(message);
       if (args[1]) {
           logToStorage(`🛠 Fetch Options: ${JSON.stringify(args[1])}`);
       }
       const response = await originalFetch.apply(this, args);
       const clonedResponse = response.clone();
       clonedResponse
           .text()
           .then((data) => {
               logToStorage(`🛬 Fetch Response Data: ${data}`);
           })
           .catch((error) => {
               logToStorage(`❌ Error Reading Fetch Response: ${error}`);
           });
       return response;
   };
   ```

### 5. **DevTools Detection Bypass**
   This section disables common methods of detecting if DevTools is open, preventing the page from being inspected.

   ```javascript
   const disableDevToolsDetection = () => {
       const noop = () => {};
       Object.defineProperty(console, "clear", { value: noop, writable: false });
       Object.defineProperty(console, "table", { value: noop, writable: false });

       setInterval(() => {
           const devtools = /./;
           devtools.toString = () => {
               throw new Error("Blocked DevTools Detection!");
           };
           console.log(devtools);
       }, 1000);

       Object.defineProperty(window, "devtools", {
           get: () => false,
           set: () => {},
       });
   };
   ```

### 6. **Page Reload Prevention**
   Prevents the page from reloading, allowing users to inspect API requests without disruption.

   ```javascript
   const preventReload = (e) => {
       e.preventDefault();
       e.returnValue = '';
       return '';
   };
   ```

### 7. **Initialization**
   Initializes the script by showing stored logs, activating the DevTools bypass, and setting up reload prevention.

   ```javascript
   showStoredLogs();
   disableDevToolsDetection();

   logToStorage("✅ API Sniffer Initialized. Perform actions on the site to capture API requests.");
   logToStorage("✅ DevTools detection bypass activated.");

   window.addEventListener("beforeunload", preventReload);
   ```

## Usage

1. Copy and paste the script into the browser's developer console or include it in your website's JavaScript.
2. Perform actions that trigger API requests (e.g., making API calls).
3. Open the console to see real-time logs of outgoing API requests and their responses.
4. Reload the page to see previously stored logs.
5. The script will automatically bypass any DevTools detection and prevent page reloads.

## Important Notes

- This script stores logs in `localStorage`, which may be cleared if the user clears their browser data.
- The script also prevents page reloads, so be cautious when testing it on production pages.
- This is a development tool and should be used for debugging purposes only.

## License

MIT License. See [LICENSE](./LICENSE) for more information.
