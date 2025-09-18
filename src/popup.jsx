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
    const [initialLimitTasks, setInitialLimitTasks] = useState(5);
    const [limitTasks, setLimitTasks] = useState(10);

    // Task detail settings
    const [defaultDuration, setDefaultDuration] = useState(30)
    const [showTimes, setShowTimes] = useState(true);
    const [limitTimes, setLimitTimes] = useState(1);

    useEffect(() => {
        chrome.storage.sync.get(['pinnedTaskRefs'], (val) => {
            if (val.pinnedTaskRefs !== undefined) setPinnedTaskRefs(val.pinnedTaskRefs);
        })

        // API settings
        chrome.storage.sync.get(['apiKey'], (val) => {
            if (val.apiKey) setApiKey(val.apiKey)
        })
        chrome.storage.sync.get(['apiUrl'], (val) => {
            if (val.apiUrl) setApiUrl(val.apiUrl);
        })

        // Task list settings
        chrome.storage.sync.get(['showOnlyMyTasks'], (val) => {
            if (val.showOnlyMyTasks !== undefined) setShowOnlyMyTasks(val.showOnlyMyTasks);
        })
        chrome.storage.sync.get(['showClosedTasks'], (val) => {
            if (val.showClosedTasks !== undefined) setShowClosedTasks(val.showClosedTasks);
        })
        chrome.storage.sync.get(['useEmojiIcons'], (val) => {
            if (val.useEmojiIcons !== undefined) setUseEmojiIcons(val.useEmojiIcons);
        });
        chrome.storage.sync.get(['initialLimitTasks'], (val) => {
            if (val.initialLimitTasks !== undefined) setInitialLimitTasks(val.initialLimitTasks)
        });
        chrome.storage.sync.get(['limitTasks'], (val) => {
            if (val.limitTasks !== undefined) setLimitTasks(val.limitTasks);
        });

        // Task detail settings
        chrome.storage.sync.get(['defaultDuration'], (val) => {
            if (val.defaultDuration !== undefined) setDefaultDuration(val.defaultDuration);
        })
        chrome.storage.sync.get(['showTimes'], (val) => {
            if (val.showTimes !== undefined) setShowTimes(val.showTimes);
        });
        chrome.storage.sync.get(['limitTimes'], (val) => {
            if (val.limitTimes !== undefined) setLimitTimes(val.limitTimes);
        });
    }, [])

    const savePinnedTaskRef = (currentPinnedTaskRef, val) => {
        let updatedPinnedTaskRefs;

        if (val) {
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
    const saveApiKey = (val) => {
        chrome.storage.sync.set({apiKey: val}, () => setApiKey(val))
    }

    const saveApiUrl = (val) => {
        chrome.storage.sync.set({apiUrl: val}, () => setApiUrl(val))
    }

    // Task list settings
    const saveShowOnlyMyTasks = (val) => {
        chrome.storage.sync.set({showOnlyMyTasks: val}, () => setShowOnlyMyTasks(val))
    }

    const saveShowClosedTasks = (val) => {
        chrome.storage.sync.set({showClosedTasks: val}, () => setShowClosedTasks(val))
    }

    const saveUseEmojiIcons = (val) => {
        chrome.storage.sync.set({useEmojiIcons: val}, () => setUseEmojiIcons(val));
    };

    const saveInitialLimitTasks = (val) => {
        chrome.storage.sync.set({initialLimitTasks: val}, () => setInitialLimitTasks(val));
    };

    const saveLimitTasks = (val) => {
        chrome.storage.sync.set({limitTasks: val}, () => setLimitTasks(val));
    };


    // Task detail settings
    const saveDefaultDuration = (val) => {
        chrome.storage.sync.set({defaultDuration: val}, () => setDefaultDuration(val))
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
                    ? <Home apiKey={apiKey} apiUrl={apiUrl}
                            showOnlyMyTasks={showOnlyMyTasks}
                            showClosedTasks={showClosedTasks}
                            setView={setView}
                            selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                            pinnedTaskRefs={pinnedTaskRefs}
                            savePinnedTaskRef={savePinnedTaskRef}
                            useEmojiIcons={useEmojiIcons}
                            initialLimitTasks={initialLimitTasks}
                            limitTasks={limitTasks} />
                    : null
                }

                {view === 'settings'
                    ? <Settings apiKey={apiKey} setApiKey={saveApiKey}
                                apiUrl={apiUrl} setApiUrl={saveApiUrl}
                                showOnlyMyTasks={showOnlyMyTasks} setShowOnlyMyTasks={saveShowOnlyMyTasks}
                                defaultDuration={defaultDuration} setDefaultDuration={saveDefaultDuration}
                                showClosedTasks={showClosedTasks} setShowClosedTasks={saveShowClosedTasks}
                                useEmojiIcons={useEmojiIcons} setUseEmojiIcons={saveUseEmojiIcons}
                                initialLimitTasks={initialLimitTasks} setInitialLimitTasks={saveInitialLimitTasks}
                                limitTasks={limitTasks} setLimitTasks={saveLimitTasks}
                                limitTimes={limitTimes} setLimitTimes={saveLimitTimes}
                                showTimes={showTimes} setShowTimes={saveShowTimes} />
                    : null
                }

                {view === 'task'
                    ? <Task apiKey={apiKey} apiUrl={apiUrl}
                            setView={setView}
                            selectedTask={selectedTask} setSelectedTask={setSelectedTask}
                            defaultDuration={defaultDuration}
                            useEmojiIcons={useEmojiIcons}
                            limitTimes={limitTimes}
                            showTimes={showTimes} />
                    : null
                }
            </div>
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
