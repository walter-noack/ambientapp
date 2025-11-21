export default function BarraNivelAmbiental({ score, nivel }) {
  const posiciones = {
    Bajo: 12,
    Básico: 36,
    Intermedio: 62,
    Avanzado: 88,
  };

  const pos = posiciones[nivel] ?? 50;

  return (
    <div className="mt-4">
      <div className="text-sm font-semibold mb-1 text-slate-700">Nivel Ambiental Global</div>

      <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden flex text-[10px]">
        <div className="flex-1 bg-red-300 text-center text-red-900">Bajo</div>
        <div className="flex-1 bg-red-200 text-center text-red-700">Básico</div>
        <div className="flex-1 bg-yellow-200 text-center text-yellow-700">Intermedio</div>
        <div className="flex-1 bg-blue-200 text-center text-blue-700">Avanzado</div>
      </div>

      <div
        className="relative h-4"
        style={{ position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            top: -2,
            left: `calc(${pos}% - 6px)`,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "10px solid #444",
          }}
        />
      </div>
    </div>
  );
}