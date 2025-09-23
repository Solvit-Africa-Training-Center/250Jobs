import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., 'max-w-2xl'
};

export default function Modal({ open, onClose, title, children, maxWidthClass = "max-w-2xl" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-lg border border-gray-300 w-full ${maxWidthClass} mx-4`}
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="p-5 text-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
}

