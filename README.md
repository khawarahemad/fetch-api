# fetch-api-
- copy and paste in dev console


```
(function () {
    // Function to log output to both the console and localStorage
    const logToStorage = (message) => {
        console.log(message);
        const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
        logs.push(message);
        localStorage.setItem("apiLogs", JSON.stringify(logs));
    };

    // Show stored logs on page reload
    const showStoredLogs = () => {
        const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
        logs.forEach(log => logToStorage(log));
    };

    // Hook into the XMLHttpRequest to log outgoing requests
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

    // Hook into the Fetch API to log outgoing requests
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

    // DevTools Detection Bypass
    const disableDevToolsDetection = () => {
        // Override the console methods used to detect dev tools
        const noop = () => {};
        Object.defineProperty(console, "clear", { value: noop, writable: false });
        Object.defineProperty(console, "table", { value: noop, writable: false });

        // Block common detection checks using `debugger` statements
        setInterval(() => {
            const devtools = /./;
            devtools.toString = () => {
                throw new Error("Blocked DevTools Detection!");
            };
            console.log(devtools);
        }, 1000);

        // Override common `devtools` checks
        Object.defineProperty(window, "devtools", {
            get: () => false,
            set: () => {},
        });
    };

    // Prevent page reload
    const preventReload = (e) => {
        e.preventDefault();
        e.returnValue = '';  // Standard for most browsers
        return '';           // For some older browsers
    };

    // Initialize by showing stored logs, activating bypass, and setting up reload prevention
    showStoredLogs();
    disableDevToolsDetection();

    logToStorage("✅ API Sniffer Initialized. Perform actions on the site to capture API requests.");
    logToStorage("✅ DevTools detection bypass activated.");

    // Attach event listener to prevent page reload
    window.addEventListener("beforeunload", preventReload);
})();

```
