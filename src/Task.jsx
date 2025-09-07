import React, {useEffect, useState} from 'react';
import {useAPIData} from "./hooks/api.js";
import Loader from "./components/Loader.jsx";
import TaskIcon from "./components/TaskIcon.jsx";
import sha256 from 'crypto-js/sha256';
import TaskTimeHistory from "./components/TaskTimeHistory.jsx";
import Input from "./components/Input.jsx";
import ExternalLink from "./components/ExternalLink.jsx";

const Task = ({apiUrl, apiKey, selectedTask, defaultDuration, useEmojiIcons, limitTimes, showTimes}) => {

    const {getTask, updateTaskTime} = useAPIData(apiUrl, apiKey);

    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateTaskTimeLoading, setIsUpdateTaskTimeLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
    const [note, setNote] = useState('');

    useEffect(() => setSelectedDuration(defaultDuration), [defaultDuration]);

    useEffect(() => {
        setIsLoading(true)
        setTask(null);

        let params = {
            ref: selectedTask.ref,
            limit_times: showTimes ? limitTimes : 0,
        }

        getTask(params).then(setTask)
            .finally(() => {
                setIsLoading(false)
                setNote('')
            })

    }, [selectedTask, showTimes, limitTimes])

    function DurationButton({duration}) {
        return (
            <div className={
                'px-3 py-2 rounded-md text-xs font-medium text-center cursor-pointer transition-transform duration-150 ' +
                (selectedDuration == duration
                    ? getBorderColor(task?.type_code) + getBgColor(task?.type_code) + getTextColor(task?.type_code) + getFocusRingColor(task?.type_code) + getBgSelectedColor(task?.type_code)
                    : getBgColor(task?.type_code) + getTextColor(task?.type_code) + getHoverBgColor(task?.type_code))}
                 onClick={() => setSelectedDuration(duration)}>
                {duration} min
            </div>
        )
    }

    function formatBusinessDuration(minutes) {
        const minutesPerDay = 480; // 8 hours * 60 minutes
        const days = Math.floor(minutes / minutesPerDay);
        const remainingMinutes = minutes % minutesPerDay;
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;

        let result = '';

        if (days > 0) {
            result += `${days} day${days > 1 ? 's' : ''}`;
        }

        if (hours > 0) {
            if (result) result += ' ';
            result += `${hours}h`;
        }

        if (mins > 0) {
            if (result) result += ' ';
            result += `${mins}min`;
        }

        // Case: less than a day and no full hours (e.g., 30min)
        if (!result) {
            result = `${mins}min`;
        }

        return result;
    }

    function updateTime(type) {
        setIsUpdateTaskTimeLoading(true);
        let duration = selectedDuration

        if (type === 'minus') {
            duration = -duration;
        }

        let params = {
            ref: task.ref,
            limit_times: showTimes ? limitTimes : 0
        }

        let data = {
            duration: duration,
            note: note,
        }

        updateTaskTime(params, data).then(setTask)
            .finally(() => {
                setIsUpdateTaskTimeLoading(false)
                setNote('')
            })

    }

    function setCustomerDuration(value) {
        setSelectedDuration(parseInt(value))
    }

    if (isLoading) {
        return <Loader />
    }

    if (!task) {
        return null;
    }

    const getBorderColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' border border-yellow-200 ';
            case 'BUG':
                return ' border border-red-200 ';
            case 'SUPPORT_N2':
                return ' border border-orange-200 ';
            case 'FEATURE':
                return ' border border-green-200 ';
            default:
                return ' border border-blue-200 ';
        }
    }

    const getBgColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' bg-yellow-100 ';
            case 'BUG':
                return ' bg-red-100 ';
            case 'SUPPORT_N2':
                return ' bg-orange-100 ';
            case 'FEATURE':
                return ' bg-green-100 ';
            default:
                return ' bg-blue-100 ';
        }
    }

    const getTextColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' text-yellow-500 ';
            case 'BUG':
                return ' text-red-500 ';
            case 'SUPPORT_N2':
                return ' text-orange-500 ';
            case 'FEATURE':
                return ' text-green-500 ';
            default:
                return ' text-blue-500 ';
        }
    }

    const getHoverBgColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' hover:bg-yellow-200 ';
            case 'BUG':
                return ' hover:bg-red-200 ';
            case 'SUPPORT_N2':
                return ' hover:bg-orange-200 ';
            case 'FEATURE':
                return ' hover:bg-green-200 ';
            default:
                return ' hover:bg-blue-200 ';
        }
    }

    const getFocusRingColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' focus:outline-none focus:ring-2 focus:ring-yellow-300 ';
            case 'BUG':
                return ' focus:outline-none focus:ring-2 focus:ring-red-300 ';
            case 'SUPPORT_N2':
                return ' focus:outline-none focus:ring-2 focus:ring-orange-300 ';
            case 'FEATURE':
                return ' focus:outline-none focus:ring-2 focus:ring-green-300 ';
            default:
                return ' focus:outline-none focus:ring-2 focus:ring-blue-300 ';
        }
    }

    const getBgSelectedColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1':
                return ' bg-yellow-200 ';
            case 'BUG':
                return ' bg-red-200 ';
            case 'SUPPORT_N2':
                return ' bg-orange-200 ';
            case 'FEATURE':
                return ' bg-green-200 ';
            default:
                return ' bg-blue-200 ';
        }
    }

    const getColor = (type_code) => {
        return getBgColor(type_code) + getTextColor(type_code) + getHoverBgColor(type_code) + getBorderColor(type_code) + getFocusRingColor(type_code);
    }

    // Format seconds to a human-friendly business duration using the existing formatter
    function formatSecondsHuman(seconds) {
        const mins = Math.round(parseInt(seconds || 0, 10) / 60);
        return formatBusinessDuration(mins);
    }

    // Format a timestamp (YYYY-MM-DD HH:mm:ss) into a local readable string
    function formatDateTime(ts) {
        if (!ts) return '';
        try {
            const d = new Date(ts.replace(' ', 'T'));
            return d.toLocaleString();
        } catch {
            return ts;
        }
    }

    function getGravatarUrl(email, size = 32) {
        const clean = (email || '').trim().toLowerCase();
        const hash = sha256(clean).toString();
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
    }

    return (
        <div className="h-[560px] overflow-hidden bg-blue-50 flex flex-col w-full">
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-2 py-4">
                <div className="mx-auto w-80">

                    <h1 className={'text-2xl font-bold mb-2 flex flex-row gap-2 text-center items-center w-full justify-center'}>
                        <TaskIcon type={task?.type_code} useEmojiIcons={useEmojiIcons} />
                        <span>{task?.ref}</span>
                    </h1>
                    <div className={'text-center py-2 rounded-lg'}>
                        {task?.subject}
                    </div>
                    {task?.user && typeof task.user === 'object' && (
                        <div className="flex items-center justify-center gap-2 py-2">
                            <img src={getGravatarUrl(task.user?.email, 32)}
                                 alt={task.user?.name}
                                 className="w-6 h-6 rounded-full" />
                            <span className="text-xs font-semibold text-gray-700">{task.user?.name}</span>
                        </div>
                    )}

                    <div className={'grid grid-cols-4 gap-1 items-center py-2'}>
                        <DurationButton duration={5} className={getColor(task?.type_code)} />
                        <DurationButton duration={10} className={getColor(task?.type_code)} />
                        <DurationButton duration={15} className={getColor(task?.type_code)} />
                        <DurationButton duration={20} className={getColor(task?.type_code)} />
                        <DurationButton duration={30} className={getColor(task?.type_code)} />
                        <DurationButton duration={60} className={getColor(task?.type_code)} />
                        <DurationButton duration={120} className={getColor(task?.type_code)} />
                        <input type={'number'} value={selectedDuration}
                               className={'px-3 py-2 rounded-md text-md text-center bg-white ' + getBorderColor(task?.type_code) + getFocusRingColor(task?.type_code)}
                               onChange={(e) => setCustomerDuration(e.target.value)} />
                    </div>

                    <div className={'grid grid-cols-6 gap-2 items-center pb-2'}>
                        <div className={'col-span-1 h-full content-center p-2 text-center cursor-pointer rounded-md bg-white ' + getBorderColor(task?.type_code) + getHoverBgColor(task?.type_code)}
                             onClick={() => updateTime('minus')}>
                            -
                        </div>
                        <div className={'col-span-4 p-2 content-center bg-white text-center rounded-md h-full'}>
                            {isUpdateTaskTimeLoading
                                ? <Loader />
                                : formatBusinessDuration(task?.time)
                            }
                        </div>
                        <div className={'col-span-1 h-full p-2 content-center text-center cursor-pointer rounded-md bg-white ' + getBorderColor(task?.type_code) + getHoverBgColor(task?.type_code)}
                             onClick={() => updateTime('plus')}>
                            +
                        </div>
                    </div>

                    <div className={'grid gap-1 items-center py-2'}>
                        <Input type={'text'}
                               placeholder={'Note'}
                               value={note}
                               onChange={(e) => setNote(e.target.value)} />
                    </div>

                    {showTimes && (
                        <TaskTimeHistory
                            times={task?.times}
                            task={task}
                            getGravatarUrl={getGravatarUrl}
                            formatDateTime={formatDateTime}
                            formatSecondsHuman={formatSecondsHuman}
                            getBgColor={getBgColor}
                            getTextColor={getTextColor}
                            getBorderColor={getBorderColor} />
                    )}

                    <div className={'mx-auto mt-4 w-1/2'}>
                        <ExternalLink href={task?.link} label="Voir sur Dolibarr" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Task;
