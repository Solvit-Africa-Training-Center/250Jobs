import React from "react";
import { useTheme } from "../../context/ThemeContext";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-2xl",
}: ModalProps) {
  const { isDark } = useTheme(); // ✅ use your theme context

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative rounded-2xl shadow-lg border w-full ${maxWidthClass} mx-4 max-h-[85vh] flex flex-col`}
        style={{
          backgroundColor: isDark ? "#1f2937" : "#ffffff", // ✅ dark bg
          color: isDark ? "#f3f4f6" : "#111827", // ✅ text color
          borderColor: isDark ? "#374151" : "#d1d5db", // ✅ border color
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl hover:text-red-600"
          style={{
            color: isDark ? "#f3f4f6" : "#111827",
          }}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header */}
        {title && (
          <div
            className="px-5 pt-5 pb-3 border-b"
            style={{
              borderColor: isDark ? "#374151" : "#e5e7eb",
            }}
          >
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
