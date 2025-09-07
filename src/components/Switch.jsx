import React from "react";

export default function Switch({id, checked, onChange, label, disabled = false}) {
    return (
        <label htmlFor={id} className="flex justify-between items-center cursor-pointer select-none w-full gap-3">
            <div className="flex flex-col">
                <span className="">{label}</span>
            </div>

            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={[
                    "relative inline-flex h-3 w-12 items-center rounded-full transition-colors",
                    checked ? "bg-gradient-to-r from-blue-500 to-purple-700" : "bg-gray-300",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                ].join(" ")}>
                <span className={[
                    "inline-block h-4 w-6 transform rounded-full bg-white shadow transition-transform hover:shadow-md",
                    checked ? "translate-x-6 hover:translate-x-5" : "translate-x-0 hover:translate-x-1"
                ].join(" ")} />
            </button>
        </label>
    );
}
