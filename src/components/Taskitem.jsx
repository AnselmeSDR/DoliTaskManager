import Star from "../svg/Star.jsx";
import React from "react";
import TaskIcon from "./TaskIcon.jsx";

const TaskItem = ({className, task, selectTask, showOnlyMyTasks, setTaskPinned, useEmojiIcons}) => {
    const getBorderColor = (type_code) => {
        switch (type_code) {
            case 'SUPPORT_N1': return 'border-yellow-500';
            case 'BUG': return 'border-red-500';
            case 'SUPPORT_N2': return 'border-orange-500';
            case 'FEATURE': return 'border-green-500';
            default: return 'border-blue-500';
        }
    };

    const getAssignee = (task) => {
        if (showOnlyMyTasks) {
            return '';
        }

        const user = task?.user;

        if (typeof user === 'string') {
            return `(${user})`;
        }

        if (user && typeof user === 'object') {
            return user.name ? `(${user.name})` : null;
        }

        return null;
    };

    return (
        <div className={`bg-white rounded py-2 pr-2 pl-2 border-l-4 w-full cursor-pointer hover:shadow-md flex flex-row items-center ${getBorderColor(task?.type_code)} ${className}`}
             onClick={() => selectTask(task)}>
            <div className="flex flex-row gap-2 flex-nowrap items-center w-full">
                <div className="grow">
                    <p className="font-bold flex flex-row gap-1 items-center">
                        <TaskIcon type={task?.type_code}
                                  className="inline-block w-4 h-4 align-middle"
                                  useEmojiIcons={useEmojiIcons} />

                        {task.ref} {getAssignee(task)}
                    </p>
                    <p className="text-gray-600">
                        {task?.subject}
                    </p>
                </div>
                <div className="ml-auto flex items-center justify-center flex-shrink-0 h-full"
                     onClick={(e) => {
                         e.stopPropagation();
                         setTaskPinned(task);
                     }}>
                    <Star className={`size-5 ${task?.is_pinned ? 'text-yellow-400' : 'text-gray-300'}`} />
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
