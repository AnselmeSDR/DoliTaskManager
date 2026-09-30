import React, { useEffect, useState } from "react";
import { useAPIData } from "./hooks/api.js";
import TaskIcon from "./components/TaskIcon.jsx";
import {
    formatBusinessDuration,
    formatDateTime,
    formatSecondsHuman,
    formatShortDuration,
    getGravatarUrl,
} from "./utils/format.js";

const durations = [5, 10, 15, 30, 60, 120];

export const Spinner = () => <div className="dtm-spinner" role="status" aria-label="Chargement" />;

// Label above value, like the fields of Jira "Details" group
const Field = ({ label, children }) => (
    <div className="dtm-field">
        <div className="dtm-field-label">{label}</div>
        <div className="dtm-field-value">{children}</div>
    </div>
);

// Task detail + time logging, styled as a native Jira issue view group
const JiraTask = ({ apiUrl, apiKey, taskRef, defaultDuration, useEmojiIcons, limitTimes, showTimes }) => {
    const { getTask, updateTaskTime } = useAPIData(apiUrl, apiKey);

    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [duration, setDuration] = useState(Number(defaultDuration));
    const [note, setNote] = useState("");

    const params = { ref: taskRef, limit_times: showTimes ? limitTimes : 0 };

    useEffect(() => {
        getTask(params)
            .then(setTask)
            .catch((error) => setError(error.message));
    }, [taskRef]);

    function updateTime(sign) {
        if (!duration) return;

        setIsUpdating(true);
        setUpdateError(null);
        updateTaskTime(params, { duration: sign * duration, note })
            .then((updatedTask) => {
                setTask(updatedTask);
                setNote("");
            })
            .catch((error) => setUpdateError(error.message))
            .finally(() => setIsUpdating(false));
    }

    if (error) {
        return <p className="dtm-message dtm-message-error">Erreur : {error}</p>;
    }

    if (!task) {
        return <Spinner />;
    }

    return (
        <>
            {/* Subject and assignee mirror the Jira issue: one line is enough */}
            <div className="dtm-summary">
                <a className="dtm-link" href={task.link} target="_blank" rel="noreferrer" title={task.subject}>
                    <TaskIcon type={task.type_code} useEmojiIcons={useEmojiIcons} className="!size-4" />
                    {task.ref}
                </a>
                {task.user?.name && (
                    <span className="dtm-user dtm-subtle">
                        <img className="dtm-avatar" src={getGravatarUrl(task.user.email, 48)} alt="" />
                        {task.user.name}
                    </span>
                )}
            </div>

            <Field label="Temps passé">
                <div className="dtm-chips">
                    {durations.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={"dtm-chip" + (value === duration ? " dtm-chip-selected" : "")}
                            onClick={() => setDuration(value)}
                        >
                            {formatShortDuration(value)}
                        </button>
                    ))}
                    <input
                        type="number"
                        min="1"
                        className="dtm-input dtm-input-number"
                        aria-label="Durée (minutes)"
                        value={duration || ""}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                    />
                </div>
                <div className="dtm-counter">
                    <button
                        type="button"
                        className="dtm-button"
                        disabled={isUpdating || !duration}
                        title={`Déduire ${formatShortDuration(duration)}`}
                        aria-label={`Déduire ${formatShortDuration(duration)}`}
                        onClick={() => updateTime(-1)}
                    >
                        −
                    </button>
                    <span className="dtm-counter-value dtm-strong">
                        {isUpdating ? "…" : formatBusinessDuration(task.time)}
                    </span>
                    <button
                        type="button"
                        className="dtm-button dtm-button-primary"
                        disabled={isUpdating || !duration}
                        title={`Ajouter ${formatShortDuration(duration)}`}
                        aria-label={`Ajouter ${formatShortDuration(duration)}`}
                        onClick={() => updateTime(1)}
                    >
                        +
                    </button>
                </div>
                {updateError && (
                    <p className="dtm-message dtm-message-error">Pointage non enregistré : {updateError}</p>
                )}
                <input
                    type="text"
                    className="dtm-input"
                    placeholder="Note (optionnelle)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </Field>

            {showTimes && task.times?.length > 0 && (
                <Field label="Historique">
                    <ul className="dtm-history">
                        {task.times.map((time, idx) => (
                            <li key={idx} className="dtm-history-item">
                                <img className="dtm-avatar" src={getGravatarUrl(time.user?.email, 48)} alt="" />
                                <div className="dtm-history-text">
                                    <span className="dtm-strong">{time.user?.name}</span>
                                    <span className="dtm-subtlest">{formatDateTime(time.date)}</span>
                                    {time.note && <span className="dtm-subtle dtm-history-note">{time.note}</span>}
                                </div>
                                <span className="dtm-lozenge">{formatSecondsHuman(Number(time.duration) || 0)}</span>
                            </li>
                        ))}
                    </ul>
                </Field>
            )}
        </>
    );
};

export default JiraTask;
