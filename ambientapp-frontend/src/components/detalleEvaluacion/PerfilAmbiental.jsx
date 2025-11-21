import RadarAmbiental from "../graficos/RadarAmbiental";

export default function PerfilAmbiental({ scores, textoRadar }) {
  return (
    <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-slate-800">Perfil Ambiental de la Empresa</h3>
      <p className="text-sm text-slate-600">
        Radar con desempeño en carbono, agua y residuos. Valores altos indican mayor madurez.
      </p>

      <div className="w-full flex justify-center">
        <div className="max-w-[360px] w-full">
          <RadarAmbiental scores={scores} />
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{textoRadar}</p>
    </div>
  );
}