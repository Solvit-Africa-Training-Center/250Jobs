import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
};

export default function Modal({ open, onClose, title, children, maxWidthClass = "max-w-2xl" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div
        className={`relative bg-white text-black rounded-2xl shadow-lg border border-gray-300 w-full ${maxWidthClass} mx-4 max-h-[85vh] flex flex-col dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black text-2xl hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
          aria-label="Close"
        >
          &times;
        </button>

        {title && (
          <div className="px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        <div className="p-5 text-black overflow-y-auto dark:text-gray-100">{children}</div>
      </div>
    </div>
  );
}
