/* global chrome */
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom/client'
import Home from "./Home.jsx";
import './index.css';
import Header from "./components/Header.jsx";
import Settings from "./Settings.jsx";
import Task from "./Task.jsx";

const App = () => {
    const [view, setView] = useState('home');
    const [pinnedTaskRefs, setPinnedTaskRefs] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

    // API settings
    const [apiKey, setApiKey] = useState('')
    const [apiUrl, setApiUrl] = useState('')

    // Task list settings
    const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(true);
    const [showClosedTasks, setShowClosedTasks] = useState(false);
    const [useEmojiIcons, setUseEmojiIcons] = useState(false);
    const [limitTasks, setLimitTasks] = useState(20);

    // Task detail settings
    const [defaultDuration, setDefaultDuration] = useState(30)
    const [showTimes, setShowTimes] = useState(true);
    const [limitTimes, setLimitTimes] = useState(1);

    useEffect(() => {
        chrome.storage.sync.get(['pinnedTaskRefs'], (result) => {
            if (result.pinnedTaskRefs !== undefined) setPinnedTaskRefs(result.pinnedTaskRefs);
        })

        // API settings
        chrome.storage.sync.get(['apiKey'], (result) => {
            if (result.apiKey) setApiKey(result.apiKey)
        })
        chrome.storage.sync.get(['apiUrl'], (result) => {
            if (result.apiUrl) setApiUrl(result.apiUrl);
        })

        // Task list settings
        chrome.storage.sync.get(['showOnlyMyTasks'], (result) => {
            if (result.showOnlyMyTasks !== undefined) setShowOnlyMyTasks(result.showOnlyMyTasks);
        })
        chrome.storage.sync.get(['showClosedTasks'], (result) => {
            if (result.showClosedTasks !== undefined) setShowClosedTasks(result.showClosedTasks);
        })
        chrome.storage.sync.get(['useEmojiIcons'], (result) => {
            if (result.useEmojiIcons !== undefined) setUseEmojiIcons(result.useEmojiIcons);
        });
        chrome.storage.sync.get(['limitTasks'], (result) => {
            if (result.limitTasks !== undefined) setLimitTasks(result.limitTasks);
        });

        // Task detail settings
        chrome.storage.sync.get(['defaultDuration'], (result) => {
            if (result.defaultDuration !== undefined) setDefaultDuration(result.defaultDuration);
        })
        chrome.storage.sync.get(['showTimes'], (result) => {
            if (result.showTimes !== undefined) setShowTimes(result.showTimes);
        });
        chrome.storage.sync.get(['limitTimes'], (result) => {
            if (result.limitTimes !== undefined) setLimitTimes(result.limitTimes);
        });
    }, [])

    const savePinnedTaskRef = (currentPinnedTaskRef, value) => {
        let updatedPinnedTaskRefs;

        if (value) {
            updatedPinnedTaskRefs = [...pinnedTaskRefs];
            if (!updatedPinnedTaskRefs.includes(currentPinnedTaskRef)) {
                updatedPinnedTaskRefs.push(currentPinnedTaskRef);
            }
        } else {
            updatedPinnedTaskRefs = pinnedTaskRefs.filter(ref => ref !== currentPinnedTaskRef);
        }

        chrome.storage.sync.set({pinnedTaskRefs: updatedPinnedTaskRefs}, () => setPinnedTaskRefs(updatedPinnedTaskRefs));
    };


    // API settings
    const saveApiKey = (currentApiKey) => {
        chrome.storage.sync.set({apiKey: currentApiKey}, () => setApiKey(currentApiKey))
    }

    const saveApiUrl = (currentApUrl) => {
        chrome.storage.sync.set({apiUrl: currentApUrl}, () => setApiUrl(currentApUrl))
    }

    // Task list settings
    const saveShowOnlyMyTasks = (showOnlyMyTasks) => {
        chrome.storage.sync.set({showOnlyMyTasks: showOnlyMyTasks}, () => setShowOnlyMyTasks(showOnlyMyTasks))
    }

    const saveShowClosedTasks = (showClosedTasks) => {
        chrome.storage.sync.set({showClosedTasks: showClosedTasks}, () => setShowClosedTasks(showClosedTasks))
    }

    const saveUseEmojiIcons = (value) => {
        chrome.storage.sync.set({useEmojiIcons: value}, () => setUseEmojiIcons(value));
    };

    const saveLimitTasks = (val) => {
        chrome.storage.sync.set({limitTasks: val}, () => setLimitTasks(val));
    };


    // Task detail settings
    const saveDefaultDuration = (currentDefaultDuration) => {
        chrome.storage.sync.set({defaultDuration: currentDefaultDuration}, () => setDefaultDuration(currentDefaultDuration))
    }

    const saveShowTimes = (val) => {
        chrome.storage.sync.set({showTimes: val}, () => setShowTimes(val));
    };

    const saveLimitTimes = (val) => {
        chrome.storage.sync.set({limitTimes: val}, () => setLimitTimes(val));
    };


    return (
        <>
            <Header view={view} setView={setView} setSelectedTask={setSelectedTask} />
            <div className={'w-full h-full'}>

                {view === 'home'
                    ? <Home apiKey={apiKey} apiUrl={apiUrl} showOnlyMyTasks={showOnlyMyTasks}
                            showClosedTasks={showClosedTasks}
                            setView={setView} selectedTask={selectedTask}
                            setSelectedTask={setSelectedTask} pinnedTaskRefs={pinnedTaskRefs}
                            savePinnedTaskRef={savePinnedTaskRef} useEmojiIcons={useEmojiIcons}
                            limitTasks={limitTasks} />
                    : null
                }

                {view === 'settings'
                    ? <Settings setApiKey={saveApiKey} apiKey={apiKey}
                                setApiUrl={saveApiUrl} apiUrl={apiUrl}
                                setShowOnlyMyTasks={saveShowOnlyMyTasks} showOnlyMyTasks={showOnlyMyTasks}
                                setDefaultDuration={saveDefaultDuration} defaultDuration={defaultDuration}
                                setShowClosedTasks={saveShowClosedTasks}
                                showClosedTasks={showClosedTasks}
                                useEmojiIcons={useEmojiIcons} setUseEmojiIcons={saveUseEmojiIcons}
                                limitTasks={limitTasks}
                                setLimitTasks={saveLimitTasks}
                                limitTimes={limitTimes}
                                setLimitTimes={saveLimitTimes}
                                showTimes={showTimes}
                                setShowTimes={saveShowTimes} />
                    : null
                }

                {view === 'task'
                    ? <Task apiKey={apiKey} apiUrl={apiUrl} setView={setView} selectedTask={selectedTask}
                            setSelectedTask={setSelectedTask} defaultDuration={defaultDuration}
                            useEmojiIcons={useEmojiIcons} limitTimes={limitTimes} showTimes={showTimes} />
                    : null
                }
            </div>
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
