import React from 'react';

const Select = ({
    label,
    name,
    value,
    onChange,
    options,
    disabled = false,
    full = true
}) => (
    <label
        className={[
            "block text-gray-900",
            full ? "w-full" : "flex justify-between items-center gap-2",
            disabled ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-900"
        ].join(" ")}
    >
        {label}
        <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={[
                `${full ? "w-full" : "w-auto"} mt-1 px-4 py-2 bg-white border border-white/50 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 focus:bg-white/60 transition-all duration-300 shadow-sm`,
                disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
            ].join(" ")}
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </label>
);

export default Select;
