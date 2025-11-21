export default function HeaderEvaluacion({ evaluacion, colorNivel }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{evaluacion.companyName}</h2>
        <p className="text-slate-600">Periodo: {evaluacion.period}</p>
      </div>

      <div
        className="px-4 py-3 rounded-xl border text-right shadow-sm bg-slate-50"
        style={{ borderColor: colorNivel }}
      >
        <p className="text-sm text-slate-500">Puntaje final</p>
        <p className="text-xl font-bold" style={{ color: colorNivel }}>
          {evaluacion.finalScore} / 100
        </p>
        <p className="text-xs font-semibold mt-1" style={{ color: colorNivel }}>
          Nivel {evaluacion.nivel}
        </p>
      </div>
    </div>
  );
}