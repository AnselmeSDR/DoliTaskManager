import React from "react";
import GlobeIcon from "./icons/GlobeIcon.jsx";

const ExternalLink = ({href, label}) => {
    return (
        <a href={href}
           target="_blank"
           className="w-full text-center group inline-flex items-center rounded-full p-[2px] bg-gradient-to-r from-blue-500 to-purple-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors duration-150">
            <span className="w-full px-4 py-2 rounded-full bg-white text-blue-700 font-semibold transition-all duration-300">
                {label}
            </span>
            <span aria-hidden
                  className="overflow-hidden transition-all duration-100 flex items-center justify-center mx-1 group-hover:w-0 group-hover:mx-0">
                <GlobeIcon className="text-white w-6 h-6" />
            </span>
        </a>
    );
};

export default ExternalLink;
