export default function AnalisisIntegrado({ textoGlobal }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300">
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Análisis integrado y prioridades
      </h3>
      <p className="text-sm text-slate-700 leading-relaxed">
        {textoGlobal}
      </p>
    </div>
  );
}