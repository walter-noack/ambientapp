export default function IndicadoresAmbientales({ emisiones, evaluacion }) {
  // ⛔ Si aún no llegan los datos, no renderizar nada
  if (!emisiones || !evaluacion) return null;

  const { totalTon, alcance1, alcance2 } = emisiones;
  const { scores } = evaluacion;

  const kpis = [
    {
      titulo: "Huella de Carbono Total",
      valor: `${isNaN(totalTon) ? "0.00" : totalTon.toFixed(2)} tCO₂e`,
      color: "#16a34a",
      detalle:
        totalTon > 20
          ? "La huella es alta. Se recomienda evaluar eficiencia energética y transición a energía renovable."
          : "La huella es moderada. Mantener control y mejorar gestión energética.",
    },
    {
      titulo: "Dependencia de Combustibles (A1)",
      valor: `${isNaN(alcance1) ? "0.00" : (alcance1 / 1000).toFixed(2)} tCO₂e`,
      color: "#059669",
      detalle:
        alcance1 > alcance2
          ? "La mayoría de tus emisiones proviene de combustibles. Revisa flota, calderas y procesos térmicos."
          : "Las emisiones por combustibles están bajo control.",
    },
    {
      titulo: "Dependencia de Electricidad (A2)",
      valor: `${isNaN(alcance2) ? "0.00" : (alcance2 / 1000).toFixed(2)} tCO₂e`,
      color: "#2563eb",
      detalle:
        alcance2 > alcance1
          ? "La electricidad es tu principal fuente de emisiones. Considera migrar a energía renovable."
          : "El consumo eléctrico no es la mayor fuente de emisiones.",
    },
    {
      titulo: "Puntaje de Agua",
      valor: `${scores.waterScore ?? 0} pts`,
      color: "#0ea5e9",
      detalle:
        scores.waterScore < 60
          ? "El consumo hídrico es elevado para el tamaño de la empresa. Se recomienda revisar fugas y eficiencia."
          : "Buen desempeño hídrico.",
    },
    {
      titulo: "Puntaje de Residuos",
      valor: `${scores.wasteScore ?? 0} pts`,
      color: "#9333ea",
      detalle:
        scores.wasteScore < 60
          ? "La valorización de residuos puede mejorar. Revisa separación y alianzas con gestores."
          : "Buena gestión de residuos.",
    },

    {
      titulo: "Intensidad Hídrica",
      valor: evaluacion.waterData?.intensidadValor
        ? `${Number(evaluacion.waterData.intensidadValor).toFixed(1)} ${evaluacion.waterData.intensidadTipo === "Consumo por unidad de producción"
          ? "L/unidad"
          : "L/persona·día"
        }`
        : "Sin datos",
      color: "#06b6d4",
      detalle: !evaluacion.waterData?.intensidadValor
        ? "No se entregó información de intensidad hídrica."
        : evaluacion.waterData.intensidadValor <= 15
          ? "Baja intensidad hídrica: buen desempeño."
          : evaluacion.waterData.intensidadValor <= 30
            ? "Intensidad hídrica moderada."
            : "Alta intensidad hídrica: revisar procesos de consumo y eficiencia.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h4 className="text-base font-bold text-slate-800 mb-1">
            {kpi.titulo}
          </h4>

          <p className="text-lg font-bold" style={{ color: kpi.color }}>
            {kpi.valor}
          </p>

          <p className="text-sm text-slate-600 mt-2">{kpi.detalle}</p>
        </div>
      ))}
    </div>
  );
}