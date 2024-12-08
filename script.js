](function () {
    // Max log entries to prevent localStorage bloat
    const MAX_LOGS = 100;

    // Function to log messages to both console and localStorage
    const logToStorage = (message) => {
        console.log(message);
        const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
        if (logs.length >= MAX_LOGS) logs.shift(); // Remove oldest log if limit exceeded
        logs.push(message);
        localStorage.setItem("apiLogs", JSON.stringify(logs));
    };

    // Show stored logs without re-logging to localStorage
    const showStoredLogs = () => {
        const logs = JSON.parse(localStorage.getItem("apiLogs") || "[]");
        logs.forEach(log => console.log(log));
    };

    // Hook into XMLHttpRequest
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        const message = `📡 API Detected (XHR):\nMethod: ${method}\nURL: ${url}`;
        logToStorage(message);
        this.addEventListener("load", function () {
            const responseMessage = `🛬 Response Status: ${this.status}\n🛠 Response Data: ${this.responseText}`;
            logToStorage(responseMessage);
        });
        return originalXHR.apply(this, arguments);
    };

    // Hook into Fetch API
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const [url, options] = args;
        const message = `📡 API Detected (Fetch):\nURL: ${url}`;
        logToStorage(message);
        if (options) logToStorage(`🛠 Fetch Options: ${JSON.stringify(options)}`);

        try {
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();

            clonedResponse.text().then((data) => {
                logToStorage(`🛬 Fetch Response:\nStatus: ${response.status}\nData: ${data}`);
            }).catch(error => {
                logToStorage(`❌ Error Reading Fetch Response: ${error}`);
            });

            return response;
        } catch (error) {
            logToStorage(`❌ Fetch Error: ${error}`);
            throw error;
        }
    };

    // Optional: Prevent page reload (configurable)
    const preventReload = (enable = true) => {
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard prompt
            return ''; // For older browsers
        };

        if (enable) {
            window.addEventListener("beforeunload", handler);
        } else {
            window.removeEventListener("beforeunload", handler);
        }
    };

    // DevTools Detection Bypass
    const disableDevToolsDetection = () => {
        const noop = () => {}; // No-operation function
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
            set: () => {}
        });
    };

    // Initialize script
    const initialize = () => {
        showStoredLogs();
        disableDevToolsDetection();
        preventReload(true);
        logToStorage("✅ API Sniffer Initialized. Perform actions to capture API requests.");
        logToStorage("✅ DevTools Detection Bypass Activated.");
    };

    initialize();
})();
