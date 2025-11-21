export default function BloqueHuellaCarbono({ totalTon, textoCarbono }) {
  return (
    <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-slate-800">
        Huella de Carbono – Alcances 1 y 2
      </h3>

      <p className="text-sm text-slate-600">
        Donut que muestra la proporción entre combustibles (A1) y electricidad (A2).
      </p>

      <div className="w-full flex justify-center">
        <div className="max-w-[220px] relative">
          <canvas id="graficoCarbono" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-bold">{totalTon.toFixed(2)} tCO₂e</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{textoCarbono}</p>
    </div>
  );
}