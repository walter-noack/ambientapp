export default function BloqueExplicacionPuntajes() {
  return (
    <div className="bg-slate-50 border rounded-xl p-4 shadow-sm">
      <p className="text-sm text-slate-700 leading-relaxed">
        Los puntajes ambientales se calculan considerando tres dimensiones clave:
        <strong> carbono</strong>, <strong>agua</strong> y <strong>residuos</strong>.
        <br /><br />
        • <strong>Carbono:</strong> basado en la huella de carbono calculada (A1 y A2).  
        • <strong>Agua:</strong> depende del consumo hídrico reportado.  
        • <strong>Residuos:</strong> evalúa el porcentaje de valorización.  
        <br /><br />
        El puntaje final corresponde a un promedio ponderado:
        <strong> 40% carbono</strong>, <strong>30% agua</strong> y <strong>30% residuos</strong>.
      </p>
    </div>
  );
}