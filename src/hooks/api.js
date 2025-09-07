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
        try {
            const response = await fetch(url, options);
            return await handleResponse(response);
        } catch (e) {
            throw e;
        }
    };

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
