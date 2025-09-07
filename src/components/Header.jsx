import React from 'react';
import Setting from "../svg/Setting.jsx";
import ArrowLeft from "../svg/ArrowLeft.jsx";

const Header = ({view, setView}) => {

    function getBackView() {
        if (view === 'settings' || view === 'task') {
            return 'home';
        }

        return null;
    }

    function Title() {
        if (view === 'settings') {
            return 'Configuration';
        }

        if (view === 'home') {
            return 'DoliTaskManager';
        }

        if (view === 'task') {
            return 'Tâche';
        }
    }

    return (
        <div className={'bg-gradient-to-r from-blue-500 to-purple-700 p-2 text-white flex-none shrink-0'}>
            <div className={'flex flex-row justify-between items-center'}>
                <div className={'flex flex-row gap-2 items-center'}>
                    {getBackView()
                        ? <div onClick={() => setView(getBackView())} className={'cursor-pointer'}>
                            <ArrowLeft />
                        </div>
                        : null
                    }
                    <p className={'text-lg font-bold'}><Title /></p>
                </div>
                {view !== 'settings'
                    ? <div onClick={() => setView('settings')} className={'cursor-pointer'}>
                        <Setting />
                    </div>
                    : <div></div>
                }
            </div>
        </div>
    );
};

export default Header;
