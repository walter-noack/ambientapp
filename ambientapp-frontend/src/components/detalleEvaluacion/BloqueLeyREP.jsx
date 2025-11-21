export default function BloqueLeyREP({ residuosRep, textoRep }) {
  const años = [...new Set(residuosRep.map(r => r.anio))].sort();

  return (
    <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Gestión de Residuos – Ley REP</h3>

      {residuosRep.length === 0 ? (
        <p className="text-sm text-slate-500">No hay registros REP asociados aún.</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            Comparación entre residuos totales y productos prioritarios...
          </p>

          {/* Datos */}
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
            <p><strong>Producto:</strong> {residuosRep[0].producto}</p>
            <p><strong>Año:</strong> {residuosRep[0].anio}</p>
            <p><strong>Generado (kg):</strong> {residuosRep[0].cantidadGenerada}</p>
            <p><strong>Valorizado (kg):</strong> {residuosRep[0].cantidadValorizada}</p>
          </div>

          <canvas id="graficoRepBarras" height="160" />

          {años.length > 1 && (
            <canvas id="graficoRepLinea" height="120" />
          )}

          <p className="text-sm text-slate-700 leading-relaxed">{textoRep}</p>
        </>
      )}
    </div>
  );
}