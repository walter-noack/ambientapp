export default function BarraAmbiental({ score, nivel }) {
  const colores = {
    Avanzado: "#0284C7",
    Intermedio: "#F59E0B",
    Básico: "#DC2626",
    Bajo: "#7F1D1D",
  };

  const colorNivel = colores[nivel] || "#6B7280";

  return (
    <div className="w-full">
      
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Nivel Ambiental
      </h3>
      
      <div className="relative w-full bg-slate-100 rounded-xl overflow-hidden shadow-sm h-8 flex">

        <div className="flex-1 bg-[rgba(127,29,29,0.25)] flex justify-center items-center text-xs text-[#7F1D1D] font-medium">
          Bajo
        </div>

        <div className="flex-1 bg-[rgba(220,38,38,0.25)] flex justify-center items-center text-xs text-[#DC2626] font-medium">
          Básico
        </div>

        <div className="flex-1 bg-[rgba(245,158,11,0.25)] flex justify-center items-center text-xs text-[#B45309] font-medium">
          Intermedio
        </div>

        <div className="flex-1 bg-[rgba(2,132,199,0.25)] flex justify-center items-center text-xs text-[#0284C7] font-medium">
          Avanzado
        </div>
      </div>

      {/* Flecha marcadora */}
      <div className="relative">
        <div
          className="absolute"
          style={{
            left: `calc(${score}% - 8px)`,
            top: "-2px",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: `16px solid ${colorNivel}`,
          }}
        />
      </div>
    </div>
  );
}