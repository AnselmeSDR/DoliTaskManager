import QuestionMarkCircle from "../svg/QuestionMarkCircle.jsx";
import BugAnt from "../svg/BugAnt.jsx";
import ExclamationTriangle from "../svg/ExclamationTriangle.jsx";
import PlusCircle from "../svg/PlusCircle.jsx";
import InformationCircle from "../svg/InformationCircle.jsx";

const Icons = {
    'DEFAULT': InformationCircle,
    'SUPPORT_N1': QuestionMarkCircle,
    'BUG': BugAnt,
    'SUPPORT_N2': ExclamationTriangle,
    'FEATURE': PlusCircle,
}

const IconStyles = {
    'DEFAULT': 'text-blue-500',
    'SUPPORT_N1': 'text-yellow-500',
    'BUG': 'text-red-500',
    'SUPPORT_N2': 'text-orange-500',
    'FEATURE': 'text-green-500',
}

const EmojiIcons = {
    'DEFAULT': 'ℹ️',
    'SUPPORT_N1': '📞',
    'BUG': '🐞',
    'SUPPORT_N2': '👨🏻‍💻',
    'FEATURE': '🚀',
}

const TaskIcon = ({type, className, useEmojiIcons}) => {
    if (!type || !Icons[type]) {
        type = 'DEFAULT'
    }

    if (useEmojiIcons) {
        return <span className={className}>{EmojiIcons[type]}</span>
    }

    const Icon = Icons[type];
    const iconStyle = IconStyles[type];

    return <Icon className={iconStyle + ' ' + className}/>
};

export default TaskIcon;
