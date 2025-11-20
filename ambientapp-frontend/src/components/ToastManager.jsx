import { useState, useEffect } from "react";

// Esta función se sobrescribe internamente para permitir disparar toasts globalmente
export let pushToast = () => {};

export default function ToastManager() {
  const [toasts, setToasts] = useState([]);

  // --- Función global para crear un toast ---
  pushToast = ({
    message,
    type = "success",
    duration = 4000,
    undo = null,   // función opcional
    linkTo = null, // ruta opcional
  }) => {
    const id = Date.now();

    // Reproducir sonido si existe
    sound.volume = 0.25;
    sound.play().catch(() => {});

    setToasts((prev) => [...prev, { id, message, type, undo, linkTo }]);

    if (!undo) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  // Colores según tipo
  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-sky-600 text-white",
  };

  return (
    <div className="fixed top-24 right-4 flex flex-col gap-3 z-[9999]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-xl shadow-xl text-sm flex items-center gap-3 animate-fade-in-up cursor-pointer transition hover:scale-[1.02] ${colors[t.type]}`}
          onClick={() => {
            // Si trae link → abrir detalle
            if (t.linkTo) window.location.href = t.linkTo;
          }}
        >
          <span>
            {t.type === "success" && "✔️"}
            {t.type === "error" && "❌"}
            {t.type === "warning" && "⚠️"}
            {t.type === "info" && "ℹ️"}
          </span>

          <span className="font-medium">{t.message}</span>

          {/* Botón UNDO */}
          {t.undo && (
            <button
              className="ml-4 px-2 py-0.5 bg-white/20 rounded hover:bg-white/30 transition text-xs"
              onClick={(e) => {
                e.stopPropagation();
                t.undo(); // ejecutar callback
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }}
            >
              Deshacer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}