import React from "react";
import { useTheme } from "../../context/ThemeContext";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

 
  const bgClass = isDark
    ? "bg-gray-900 text-gray-100 placeholder-gray-400 border border-gray-700 focus:ring-gray-600"
    : "bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:ring-gray-300";

  const labelClass = isDark ? "text-gray-200" : "text-gray-700";

  return (
    <label className="block w-full">
      {label && <span className={`block mb-1 text-sm font-medium ${labelClass}`}>{label}</span>}
      <input
        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${bgClass} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
