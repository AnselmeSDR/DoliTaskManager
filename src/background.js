/* global chrome */
// src/background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installée.');
});

// API proxy for the task view embedded in Jira (see apiFetch in src/hooks/api.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== 'dtm:fetch') return;
    // Extension pages only (embedded view), never content scripts running in web pages
    if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return;

    chrome.storage.sync.get(['apiUrl'], ({apiUrl}) => {
        // Trailing slash: "https://api.example" must not match "https://api.example.evil.com"
        if (!apiUrl || !message.url?.startsWith(`${apiUrl}/`)) {
            sendResponse({error: 'URL non autorisée'});
            return;
        }

        fetch(message.url, message.options)
            .then(async (response) => sendResponse({
                status: response.status,
                ok: response.ok,
                body: response.ok ? await response.json() : null,
            }))
            .catch((error) => sendResponse({error: error.message}));
    });

    // Keep the channel open for the async response
    return true;
});
