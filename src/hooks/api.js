/* global chrome */
export const useAPIData = (endpoint, token) => {

    const searchTasks = async (params) => {
        const url = `${endpoint}/custom/vold/ticket_api.php?action=search_tasks&${new URLSearchParams(params).toString()}`;

        return apiFetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    };

    const getPinnedTasks = async (params) => {
        const url = `${endpoint}/custom/vold/ticket_api.php?action=get_pinned_tasks&${new URLSearchParams(params).toString()}`;

        return apiFetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    };

    const getTask = async (params) => {
        const url = `${endpoint}/custom/vold/ticket_api.php?action=get_task&${new URLSearchParams(params).toString()}`;

        return apiFetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    };

    const updateTaskTime = async (params, data) => {
        const url = `${endpoint}/custom/vold/ticket_api.php?action=update_task_time&${new URLSearchParams(params).toString()}`;

        return apiFetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    };

    const apiFetch = async (url, options = {}) => {
        // Embedded in Jira (iframe), the API preflight fails CORS: fetch from the background service worker
        const response = window.self !== window.top
            ? await backgroundFetch(url, options)
            : await fetch(url, options);

        return await handleResponse(response);
    };

    const backgroundFetch = (url, options) => new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: 'dtm:fetch', url, options}, (result) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            if (result?.error) return reject(new Error(result.error));

            // Response-like object for handleResponse
            resolve({status: result.status, ok: result.ok, json: async () => result.body});
        });
    });

    const handleResponse = async (response) => {
        if (response.status === 401) {
            throw new Error("Bad credential or session expired");
        }

        if (!response.ok) {
            throw new Error("Error");
        }

        return await response.json();
    };

    return {searchTasks, getTask, updateTaskTime, getPinnedTasks};
};
