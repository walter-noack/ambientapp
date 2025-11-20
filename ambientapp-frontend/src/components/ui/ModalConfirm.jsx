import React from "react";

export default function ModalConfirm({ open, onClose, onConfirm, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">

        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {title}
        </h2>

        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}