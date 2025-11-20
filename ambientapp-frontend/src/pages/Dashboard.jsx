// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvaluaciones } from "../services/api";

import CardIndicador from "../components/CardIndicador";
import MedioDonutScore from "../components/MedioDonutScore";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    promedios: {
      carbonScore: 0,
      waterScore: 0,
      wasteScore: 0,
    },
    finalScorePromedio: 0,
    distribucionNiveles: {
      Avanzado: 0,
      Intermedio: 0,
      Básico: 0,
      Bajo: 0,
    },
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const evaluaciones = await getEvaluaciones();

      if (evaluaciones.length === 0) {
        setLoading(false);
        return;
      }

      const total = evaluaciones.length;

      const sumaCarbono = evaluaciones.reduce(
        (acc, ev) => acc + ev.scores.carbonScore,
        0
      );
      const sumaAgua = evaluaciones.reduce(
        (acc, ev) => acc + ev.scores.waterScore,
        0
      );
      const sumaResiduos = evaluaciones.reduce(
        (acc, ev) => acc + ev.scores.wasteScore,
        0
      );
      const sumaFinal = evaluaciones.reduce(
        (acc, ev) => acc + ev.finalScore,
        0
      );

      const niveles = { Avanzado: 0, Intermedio: 0, Básico: 0, Bajo: 0 };
      evaluaciones.forEach((ev) => {
        if (niveles[ev.nivel] !== undefined) {
          niveles[ev.nivel]++;
        }
      });

      setStats({
        total,
        promedios: {
          carbonScore: (sumaCarbono / total).toFixed(1),
          waterScore: (sumaAgua / total).toFixed(1),
          wasteScore: (sumaResiduos / total).toFixed(1),
        },
        finalScorePromedio: (sumaFinal / total).toFixed(1),
        distribucionNiveles: niveles,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const scorePromedio = Number(stats.finalScorePromedio || 0);

  return (
    <div className="space-y-10">
      {/* TITULO */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-1">
          Dashboard Ambiental
        </h1>
        <p className="text-slate-600">Resumen general de las evaluaciones</p>
      </div>

      {/* BOTONES ARRIBA */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate("/nueva")}
          className="btn-primary flex items-center gap-2"
        >
          ➕ Nueva Evaluación
        </button>

        <button
          onClick={() => navigate("/evaluaciones")}
          className="btn-secondary flex items-center gap-2"
        >
          📋 Ver Evaluaciones
        </button>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardIndicador
          titulo="Total Evaluaciones"
          valor={stats.total}
          icono="📊"
          color="blue"
        />
        <CardIndicador
          titulo="Score Promedio"
          valor={stats.finalScorePromedio}
          unidad="/100"
          icono="⭐"
          color="green"
        />
        <CardIndicador
          titulo="Nivel Avanzado"
          valor={stats.distribucionNiveles.Avanzado}
          icono="🔵"
          color="sky"
        />
        <CardIndicador
          titulo="Nivel Bajo"
          valor={stats.distribucionNiveles.Bajo}
          icono="🔴"
          color="red"
        />
      </div>

      {/* MEDIO DONUT + SEMÁFORO LADO A LADO */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  {/* MEDIO DONUT SCORE */}
  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
      Puntaje Ambiental Global
    </h2>

    <MedioDonutScore score={scorePromedio} />

    <p className="text-center mt-4 text-slate-600 text-sm">
      Este indicador resume el desempeño ambiental promedio considerando
      emisiones, agua y residuos.
    </p>
  </div>

  {/* SEMÁFORO DE NIVELES */}
  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
      Distribución por Nivel (Escala 4 niveles)
    </h2>

    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <span className="font-medium text-blue-700">🔵 Avanzado</span>
        <span className="text-2xl font-bold text-blue-700">
          {stats.distribucionNiveles.Avanzado}
        </span>
      </div>

      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
        <span className="font-medium text-yellow-700">🟡 Intermedio</span>
        <span className="text-2xl font-bold text-yellow-600">
          {stats.distribucionNiveles.Intermedio}
        </span>
      </div>

      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
        <span className="font-medium text-orange-600">🟠 Básico</span>
        <span className="text-2xl font-bold text-orange-600">
          {stats.distribucionNiveles.Básico}
        </span>
      </div>

      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
        <span className="font-medium text-red-700">🔴 Bajo</span>
        <span className="text-2xl font-bold text-red-700">
          {stats.distribucionNiveles.Bajo}
        </span>
      </div>
    </div>
  </div>

</div>

      {/* FOOTER */}
      <p className="text-center text-xs text-slate-400 pt-6">
        Elaborado por @mellamowalter.cl — 2025
      </p>
    </div>
  );
}