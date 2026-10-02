/* global chrome */
// Shared by content-jira.js and content-gitlab.js: loaded first, same isolated world (see manifest.json)
// eslint-disable-next-line no-unused-vars
const dtm = (() => {
    const panelId = "dtm-panel";
    const pollDelayMs = 500;
    const extensionOrigin = new URL(chrome.runtime.getURL("")).origin;

    // host ("jira" | "gitlab") selects the look of the embedded view (see src/embed.css)
    function createPanel(key, host) {
        const iframe = document.createElement("iframe");
        iframe.id = panelId;
        iframe.title = "DoliTaskManager";
        iframe.dataset.ref = key;
        iframe.src = chrome.runtime.getURL(`index.html?embed=task&ref=${encodeURIComponent(key)}&host=${host}`);
        return iframe;
    }

    // Keeps the panel of ticket `key` at {parent, before}; removes it without key or insertion point
    function syncPanel(key, host, findInsertionPoint) {
        const panel = document.getElementById(panelId);
        const insertionPoint = key ? findInsertionPoint() : null;

        if (!insertionPoint) {
            panel?.remove();
            return;
        }

        const { parent, before } = insertionPoint;
        const isInPlace = panel?.parentElement === parent && panel.nextElementSibling === before;
        if (isInPlace && panel.dataset.ref === key) return;

        panel?.remove();
        parent.insertBefore(createPanel(key, host), before);
    }

    // getTheme() returns {tokens, fontFamily}: --ds-* values the embedded view is styled with
    function watchPanel(getTheme) {
        const sendTheme = () => {
            const panel = document.getElementById(panelId);
            // Until the embedded view is ready, the iframe still holds a blank document of the page origin
            if (!panel?.contentWindow || !panel.dataset.ready) return;

            panel.contentWindow.postMessage({ type: "dtm:theme", ...getTheme() }, extensionOrigin);
        };

        // Messages from the embedded view: ready (wants the theme) and height changes
        window.addEventListener("message", (event) => {
            const panel = document.getElementById(panelId);
            if (!panel || event.source !== panel.contentWindow) return;

            if (event.data?.type === "dtm:ready") {
                panel.dataset.ready = "true";
                sendTheme();
            }
            if (event.data?.type === "dtm:resize") panel.style.height = `${event.data.height}px`;
        });

        // Light/dark switch changes attributes on <html>
        new MutationObserver(sendTheme).observe(document.documentElement, { attributes: true });
    }

    // Fills `settings` (defaults as initial values) from chrome.storage and keeps it up to date
    function watchSettings(settings, onChange) {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== "sync") return;

            for (const [name, { newValue }] of Object.entries(changes)) {
                if (name in settings) settings[name] = newValue;
            }
            onChange();
        });

        chrome.storage.sync.get(Object.keys(settings), (values) => {
            for (const [name, value] of Object.entries(values)) {
                if (value !== undefined) settings[name] = value;
            }
            onChange();
        });
    }

    // Pages are SPAs / re-rendered by their framework: re-sync periodically
    function poll(callback) {
        const interval = setInterval(() => {
            // Extension reloaded: this script is orphaned
            if (!chrome.runtime?.id) {
                clearInterval(interval);
                return;
            }
            callback();
        }, pollDelayMs);
    }

    return { panelId, syncPanel, watchPanel, watchSettings, poll };
})();
