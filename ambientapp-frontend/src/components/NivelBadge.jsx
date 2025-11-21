export default function NivelBadge({ nivel }) {
  const estilos = {
    Bajo: "bg-red-100 text-red-700 border-red-300",
    Básico: "bg-rose-100 text-rose-700 border-rose-300",
    Intermedio: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Avanzado: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border ${estilos[nivel] || "bg-gray-100 text-gray-700 border-gray-300"}`}
    >
      {nivel}
    </span>
  );
}