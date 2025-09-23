import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="block mb-1 text-sm font-medium text-gray-700">{label}</span>
      ) : null}
      <input
        className={`w-full bg-white text-black placeholder-gray-500 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-red-600 mt-1 block">{error}</span> : null}
    </label>
  );
}
