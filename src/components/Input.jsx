import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, inputMode }) => (
    <label className="w-full">
        {label}
        <div className="mt-1 rounded-lg p-[2px] bg-transparent transition-all duration-300 focus-within:bg-gradient-to-r focus-within:from-blue-500 focus-within:to-purple-700">
            <input type={type}
                name={name}
                className="w-full px-4 py-2 bg-white rounded-md placeholder-gray-500 outline-none focus:outline-none focus-visible:outline-none border-0"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                inputMode={inputMode}
                autoComplete="off"
            />
        </div>
    </label>
);

export default Input;
