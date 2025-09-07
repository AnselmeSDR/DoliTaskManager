import React from 'react';

const TaskTimeHistory = ({
                             times = [],
                             task,
                             getGravatarUrl,
                             formatDateTime,
                             formatSecondsHuman,
                             getBgColor,
                             getTextColor,
                             getBorderColor,
                         }) => {
    return (
        <div className={'pt-4'}>
            <h2 className={'text-sm font-semibold text-gray-700 mb-2'}>Historique des temps</h2>
            <div className={'mb-2'}>
                <ul className={'flex flex-col gap-1'}>
                    {times.length > 0 && times.map((time, idx) => (
                        <li key={idx}
                            className={'flex items-center gap-3 bg-white rounded-md p-2 border'}>
                            <img src={getGravatarUrl(time.user?.email, 32)}
                                 className={'w-8 h-8 rounded-full flex-shrink-0'} />

                            <div className={'min-w-0 flex-1'}>
                                <div className={'flex flex-col gap-0.5'}>
                                    <span className={'text-sm font-semibold text-gray-800'}>{time.user?.name}</span>
                                    <span className={'text-xs text-gray-400'}>{formatDateTime(time.date)}</span>
                                </div>
                                {time.note && <div className={'text-xs italic text-gray-500 mt-1 break-words'}>{time.note}</div>}
                            </div>

                            <div className={
                                'ml-auto text-xs font-medium px-2 py-0.5 rounded-md '
                                + getBgColor(task?.type_code)
                                + getTextColor(task?.type_code)
                                + getBorderColor(task?.type_code)
                            }>
                                {formatSecondsHuman(Number(time.duration) || 0)}
                            </div>
                        </li>
                    ))}
                </ul>

                {times.length === 0 && <div className={'text-xs text-gray-500 italic'}>Aucun temps enregistré.</div>}
            </div>
        </div>
    );
};

export default TaskTimeHistory;
