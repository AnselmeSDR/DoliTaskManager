/* global chrome */
import React, {useEffect, useRef, useState} from 'react';
import {useAPIData} from "./hooks/api.js";
import Loader from "./components/Loader.jsx";
import config from './config.js';
import TaskItem from "./components/Taskitem.jsx";

const Home = ({
                  apiUrl,
                  apiKey,
                  showOnlyMyTasks,
                  showClosedTasks,
                  setView,
                  setSelectedTask,
                  pinnedTaskRefs,
                  savePinnedTaskRef,
                  useEmojiIcons,
                  limitTasks,
              }) => {
    const {searchTasks, getTask} = useAPIData(apiUrl, apiKey);

    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState([]);
    const [pinnedTasks, setPinnedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPinned, setIsLoadingPinned] = useState(false);
    const [lastRefFounded, setLastRefFounded] = useState('');

    // Sticky headers refs & heights for auto top calculation
    const searchBarRef = useRef(null);
    const pinnedHeaderRef = useRef(null);
    const tasksHeaderRef = useRef(null);

    const [searchBarHeight, setSearchBarHeight] = useState(0);
    const [pinnedHeaderHeight, setPinnedHeaderHeight] = useState(0);

    // Measure sticky blocks heights on mount and window resize
    useEffect(() => {
        function updateHeights() {
            setSearchBarHeight(searchBarRef.current ? searchBarRef.current.offsetHeight : 0);
            setPinnedHeaderHeight(pinnedHeaderRef.current ? pinnedHeaderRef.current.offsetHeight : 0);
        }

        updateHeights();
        window.addEventListener('resize', updateHeights);
        return () => window.removeEventListener('resize', updateHeights);
    }, []);

    // DEBOUNCE
    useEffect(() => {
        const delay = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 400);

        return () => clearTimeout(delay); // réinitialisation si frappe avant la fin du délai
    }, [inputValue]);

    useEffect(() => {
        if (!apiKey || !apiUrl) return;

        const fetchTasks = async () => {
            setIsLoading(true);

            let currentSearchTerm = searchTerm;

            if (searchTerm === '') {
                currentSearchTerm = await findTaskRef();
                if (currentSearchTerm && lastRefFounded !== currentSearchTerm) {
                    setInputValue(currentSearchTerm); // ← met aussi à jour le champ input
                    setLastRefFounded(currentSearchTerm);
                } else {
                    currentSearchTerm = '';
                }
            }

            const params = {
                search_term: currentSearchTerm,
                limit_tasks: limitTasks,
            };
            if (showOnlyMyTasks === false) {
                params.view_all_tasks = true;
            }
            if (showClosedTasks === true) {
                params.closed_only = true;
            }

            try {
                const items = await searchTasks(params) || [];
                const itemsWithPinned = items.map(item => ({
                    ...item,
                    is_pinned: pinnedTaskRefs?.includes(item.ref) || false
                }));
                setTasks(itemsWithPinned);
            } catch (error) {
                console.error("Erreur lors de la récupération des tâches:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks()
    }, [searchTerm, apiUrl, apiKey, showOnlyMyTasks, showClosedTasks, pinnedTaskRefs, limitTasks]);

    useEffect(() => {
        if (!apiKey || !apiUrl) return;

        const fetchPinnedTasks = async () => {
            setIsLoadingPinned(true);

            let pinnedTasks = [];
            pinnedTaskRefs.forEach(ref => {
                getTask({ref}).then(task => {
                    if (task) {
                        task.is_pinned = true;
                        pinnedTasks.push(task);
                    }
                }).catch(error => console.error("Erreur lors de la récupération de la tâche épinglée:", error));
            });

            setPinnedTasks(pinnedTasks);
            setIsLoadingPinned(false);
        };

        fetchPinnedTasks()
    }, [pinnedTaskRefs, apiUrl, apiKey]);

    const findTaskRef = async () => {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                const tab = tabs[0];
                if (!tab?.url) {
                    return resolve('');
                }

                const url = new URL(tab.url);
                const hostname = url.hostname;
                const pathname = url.pathname;

                if (hostname === config.ATLASSIAN_HOSTNAME) {
                    // Priorité à selectedIssue
                    if (url.searchParams.has("selectedIssue")) {
                        return resolve(url.searchParams.get("selectedIssue"));
                    }

                    const matches = pathname.match(/([A-Z]+-\d+)/g);
                    if (matches && matches.length) {
                        return resolve(matches[0]);
                    }
                }

                return resolve('');
            });
        });
    };

    function selectTask(currentTask) {
        setSelectedTask(currentTask);
        setView('task');
    }

    function setTaskPinned(currentTask) {
        savePinnedTaskRef(currentTask.ref, !currentTask.is_pinned);
    }

    return (
        <div className="h-[560px] overflow-hidden bg-blue-50 flex flex-col w-full">
            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1">
                {/* Search bar sticky with gradient and glass effect */}
                <div ref={searchBarRef}
                     className="sticky z-10 bg-gradient-to-r from-blue-500 to-purple-700 pb-2"
                     style={{top: 0}}>
                    <div className="flex items-center gap-2 px-2">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300 shadow-sm"
                                placeholder="Rechercher une tâche…"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Section Épinglés sticky header */}
                <div ref={pinnedHeaderRef}
                     className="sticky z-10 bg-blue-50 py-1 px-2"
                     style={{top: searchBarHeight}}>
                    <div className="flex items-center gap-1 text-yellow-700 font-semibold text-sm">
                        <span>Épinglés</span>
                        <span className="text-xs font-normal text-gray-400">({pinnedTasks.length})</span>
                    </div>
                </div>

                {/* Liste des pinned tasks */}
                <div className="flex flex-col gap-2 px-2 pb-2">
                    {isLoadingPinned && <Loader className="mx-auto text-center" />}
                    {!isLoadingPinned && pinnedTasks.length === 0 &&
                        <p className="text-gray-400 text-sm">Aucune tâche épinglée.</p>
                    }
                    {!isLoadingPinned && pinnedTasks.map((pinnedTask) => (
                        <TaskItem
                            key={pinnedTask.ref}
                            className="bg-yellow-50 border rounded-lg shadow px-3 py-2"
                            task={pinnedTask}
                            setTaskPinned={setTaskPinned}
                            selectTask={selectTask}
                            showOnlyMyTasks={showOnlyMyTasks}
                            useEmojiIcons={useEmojiIcons}
                        />
                    ))}
                </div>

                {/* Toutes les tâches sticky header */}
                <div ref={tasksHeaderRef}
                     className="sticky z-10 bg-blue-50 py-1 px-2"
                     style={{top: searchBarHeight + pinnedHeaderHeight}}>
                    <div className="flex items-center gap-1 text-blue-700 font-semibold text-sm">
                        <span>Toutes les tâches</span>
                        <span className="text-xs font-normal text-gray-400">({tasks.length})</span>
                    </div>
                </div>

                {/* Liste des tasks */}
                <div className="flex flex-col gap-2 w-full pb-2 px-2">
                    {isLoading && <Loader className="mx-auto text-center" />}
                    {!isLoading && tasks.length === 0 &&
                        <p className="text-gray-400 text-sm">Aucun résultat :(</p>
                    }
                    {!isLoading && tasks.map((task) => (
                        <TaskItem key={task.ref}
                                  className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2"
                                  task={task}
                                  setTaskPinned={setTaskPinned}
                                  selectTask={selectTask}
                                  showOnlyMyTasks={showOnlyMyTasks}
                                  useEmojiIcons={useEmojiIcons}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Home;
