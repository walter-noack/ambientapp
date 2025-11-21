export default function KPICards({ evaluacion, emisiones }) {
  const { carbonScore, waterScore, wasteScore } = evaluacion.scores;
  const { totalTon, alcance1, alcance2 } = emisiones;

  const a1 = (alcance1 / 1000).toFixed(2);
  const a2 = (alcance2 / 1000).toFixed(2);

  const kpis = [
    { nombre: "Puntaje Carbono", valor: `${carbonScore} pts`, color: "#DC2626" },
    { nombre: "Puntaje Agua", valor: `${waterScore} pts`, color: "#2563EB" },
    { nombre: "Puntaje Residuos", valor: `${wasteScore} pts`, color: "#059669" },
    { nombre: "Huella Total", valor: `${totalTon.toFixed(2)} tCO₂e`, color: "#111" },
    { nombre: "Alcance 1 (A1)", valor: `${a1} tCO₂e`, color: "#16A34A" },
    { nombre: "Alcance 2 (A2)", valor: `${a2} tCO₂e`, color: "#3B82F6" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {kpis.map((k, i) => (
        <div key={i} className="p-4 border shadow-sm rounded-xl bg-white">
          <p className="text-xs text-slate-600">{k.nombre}</p>
          <p className="text-lg font-bold" style={{ color: k.color }}>
            {k.valor}
          </p>
        </div>
      ))}
    </div>
  );
}