import React from "react";

export default function GaugeSemicircular({ value = 0 }) {
  const clamp = Math.max(0, Math.min(100, value));
  const angle = (clamp / 100) * 180; // 0 → 180 grados

  // Colores por nivel
  const getColor = () => {
    if (clamp >= 80) return "#0284C7";     // Avanzado (azul)
    if (clamp >= 60) return "#F59E0B";     // Intermedio (amarillo)
    if (clamp >= 30) return "#DC2626";     // Básico (rojo claro)
    return "#7F1D1D";                      // Bajo (rojo oscuro)
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-64 h-32 overflow-hidden">
        {/* Contenedor de colores */}
        <div
          className="absolute inset-0 rounded-t-full border-4 border-gray-200"
          style={{
            background: `
              linear-gradient(
                90deg,
                #7F1D1D 0%,
                #DC2626 30%,
                #F59E0B 60%,
                #0284C7 100%
              )
            `,
          }}
        />

        {/* Aguja */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom w-1 h-24"
          style={{
            backgroundColor: getColor(),
            transform: `translateX(-50%) rotate(${angle - 90}deg)`,
            borderRadius: "2px",
          }}
        />

        {/* Puntito */}
        <div
          className="absolute bottom-0 left-1/2 w-3 h-3 bg-gray-700 rounded-full"
          style={{ transform: "translateX(-50%) translateY(2px)" }}
        />
      </div>

      {/* Valor numérico */}
      <p className="mt-2 text-xl font-bold text-slate-700">
        {clamp} / 100
      </p>

      <p className="text-sm text-gray-500">Promedio Ambiental</p>
    </div>
  );
}