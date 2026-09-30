/* global chrome */
import React, { useEffect, useState } from "react";
import { useAPIData } from "./hooks/api.js";
import TaskIcon from "./components/TaskIcon.jsx";
import JiraTask, { Spinner } from "./JiraTask.jsx";
import "./embed.css";

const settingKeys = ["apiKey", "apiUrl", "useEmojiIcons", "defaultDuration", "showTimes", "limitTimes"];

// Report content height to the Jira content script, which sizes the iframe
function useAutoResize() {
    useEffect(() => {
        // Measure #root: documentElement.scrollHeight never shrinks below the iframe height
        const root = document.getElementById("root");
        const observer = new ResizeObserver(() => {
            window.parent.postMessage({ type: "dtm:resize", height: root.offsetHeight }, "*");
        });
        observer.observe(root);
        return () => observer.disconnect();
    }, []);
}

// Apply the Jira design tokens (--ds-*) sent by the content script, so the panel follows Jira light/dark theme
function useJiraTheme() {
    useEffect(() => {
        const onMessage = (event) => {
            if (event.source !== window.parent || event.data?.type !== "dtm:theme") return;

            const rootStyle = document.documentElement.style;
            for (const [name, value] of Object.entries(event.data.tokens)) {
                rootStyle.setProperty(name, value);
            }
            if (event.data.fontFamily) rootStyle.setProperty("--dtm-font-family", event.data.fontFamily);
        };

        window.addEventListener("message", onMessage);
        window.parent.postMessage({ type: "dtm:ready" }, "*");
        return () => window.removeEventListener("message", onMessage);
    }, []);
}

const Chevron = ({ isOpen }) => (
    <svg className={"dtm-chevron" + (isOpen ? "" : " dtm-chevron-closed")} viewBox="0 0 16 16" aria-hidden="true">
        <path
            fill="currentColor"
            d="M3.47 5.47a.75.75 0 0 1 1.06 0L8 8.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
        />
    </svg>
);

// Dolibarr task group embedded in the Jira issue right column (index.html?embed=task&ref=KEY)
const Embed = ({ taskRef }) => {
    const [settings, setSettings] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [selectedRef, setSelectedRef] = useState(null);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(true);

    const { searchTasks } = useAPIData(settings?.apiUrl, settings?.apiKey);

    useAutoResize();
    useJiraTheme();

    useEffect(() => {
        chrome.storage.sync.get(settingKeys, setSettings);
        chrome.storage.local.get(["jiraPanelOpen"], (val) => {
            if (val.jiraPanelOpen !== undefined) setIsOpen(val.jiraPanelOpen);
        });
    }, []);

    useEffect(() => {
        if (!settings?.apiUrl || !settings?.apiKey) return;

        const params = { search_term: taskRef, limit_tasks: 10, view_all_tasks: true };
        const cacheKey = `embedSearch:${taskRef}`;

        const showTasks = (list) => {
            const exactMatch = list.find((item) => item.ref?.toUpperCase() === taskRef.toUpperCase());

            setTasks(list);
            // Keep the current selection: a change would make JiraTask fetch again
            if (exactMatch || list.length === 1) setSelectedRef((current) => current ?? (exactMatch ?? list[0]).ref);
        };

        // Show the last search result instantly, then refresh it in the background
        chrome.storage.session.get(cacheKey, (val) => {
            if (val[cacheKey]) showTasks(val[cacheKey]);
        });

        searchTasks(params)
            .then((items) => {
                chrome.storage.session.set({ [cacheKey]: items || [] });
                showTasks(items || []);
            })
            .catch((error) => {
                console.error("Erreur lors de la recherche de la tâche:", error);
                setError(error.message);
                setTasks((current) => current ?? []);
            });
    }, [settings?.apiUrl, settings?.apiKey, taskRef]);

    function toggle() {
        chrome.storage.local.set({ jiraPanelOpen: !isOpen });
        setIsOpen(!isOpen);
    }

    function renderBody() {
        if (!settings || !tasks) {
            return <Spinner />;
        }

        if (selectedRef) {
            return (
                <>
                    {tasks.length > 1 && (
                        <button type="button" className="dtm-link-button" onClick={() => setSelectedRef(null)}>
                            ← Autres tâches ({tasks.length})
                        </button>
                    )}
                    <JiraTask
                        key={selectedRef}
                        apiUrl={settings.apiUrl}
                        apiKey={settings.apiKey}
                        taskRef={selectedRef}
                        defaultDuration={settings.defaultDuration ?? 30}
                        useEmojiIcons={settings.useEmojiIcons ?? false}
                        limitTimes={settings.limitTimes ?? 1}
                        showTimes={settings.showTimes ?? true}
                    />
                </>
            );
        }

        if (tasks.length === 0 && error) {
            return (
                <p className="dtm-message dtm-message-error">
                    Erreur lors de la recherche de {taskRef} : {error}
                </p>
            );
        }

        if (tasks.length === 0) {
            return <p className="dtm-message">Aucune tâche Dolibarr liée à {taskRef}.</p>;
        }

        return (
            <div className="dtm-options">
                {tasks.map((task) => (
                    <button
                        key={task.ref}
                        type="button"
                        className="dtm-option"
                        onClick={() => setSelectedRef(task.ref)}
                    >
                        <TaskIcon
                            type={task.type_code}
                            useEmojiIcons={settings.useEmojiIcons ?? false}
                            className="!size-4 shrink-0"
                        />
                        <span className="dtm-strong">{task.ref}</span>
                        <span className="dtm-subtle dtm-ellipsis">{task.subject}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <section className="dtm-panel">
            <button type="button" className="dtm-header" aria-expanded={isOpen} onClick={toggle}>
                <Chevron isOpen={isOpen} />
                <span>DoliTaskManager</span>
            </button>
            {isOpen && <div className="dtm-body">{renderBody()}</div>}
        </section>
    );
};

export default Embed;
