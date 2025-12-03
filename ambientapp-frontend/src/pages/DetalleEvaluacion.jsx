// src/pages/DetalleEvaluacion.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getEvaluacionById, getResiduosRep } from "../services/api";
import BarraAmbiental from "../components/BarraAmbiental";
import RadarAmbiental from "../components/graficos/RadarAmbiental";
import IndicadoresAmbientales from "../components/graficos/IndicadoresAmbientales";
import GraficoCarbono from "../components/graficos/GraficoCarbono";
import { calcularEmisionesCarbono } from "../utils/calculosHuella";
import GraficoRep from "../components/graficos/GraficoREP";

import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// -----------------------------------------------------------------------------
// 🧠 Funciones de interpretación (sin cambios, porque están buenas)
// -----------------------------------------------------------------------------
function interpretarRadar(scores) { /* … sin cambios … */ }
function interpretarCarbono(emisiones) { /* … sin cambios … */ }
function interpretarRep(residuosRep, evaluacion) { /* … sin cambios … */ }
function analisisGlobal(evaluacion, emisionesVista, residuosRep) { /* … sin cambios … */ }

// -----------------------------------------------------------------------------
// 🌿 COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
export default function DetalleEvaluacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);

  const [residuosRep, setResiduosRep] = useState([]);
  const [repLoaded, setRepLoaded] = useState(false);

  // ================================
  // Cargar evaluación y REP
  // ================================
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEvaluacionById(id);
        setEvaluacion(data);

        const empresa =
          data?.empresaId && data?.empresaId !== "null"
            ? data.empresaId
            : "EMPRESA_ADMIN";

        const repResp = await getResiduosRep(empresa);
        setResiduosRep(repResp.data || []);
        setRepLoaded(true);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  // ================================
  // Cargar gráfico REP LÍNEAS
  // ================================
  const graficoRepLineasRef = useRef(null);
  const canvasRepLineas = useRef(null);

  useEffect(() => {
    if (!repLoaded || residuosRep.length === 0) return;

    const años = [...new Set(residuosRep.map(r => r.anio))].sort();
    if (años.length < 2) return;

    if (graficoRepLineasRef.current) graficoRepLineasRef.current.destroy();

    const porcentajes = años.map(a => {
      const registros = residuosRep.filter(r => r.anio === a);
      const sum = registros.reduce(
        (acc, r) =>
          acc + ((r.cantidadValorizada / r.cantidadGenerada) * 100 || 0),
        0
      );
      return records = sum / (registros.length || 1);
    });

    graficoRepLineasRef.current = new Chart(canvasRepLineas.current, {
      type: "line",
      data: {
        labels: años,
        datasets: [
          {
            label: "% valorización promedio",
            data: porcentajes,
            borderColor: "#0ea5e9",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: true, position: "bottom" },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (v) => `${v}%` },
          },
        },
      },
    });

    return () => {
      if (graficoRepLineasRef.current) graficoRepLineasRef.current.destroy();
    };
  }, [repLoaded, residuosRep]);

  // ================================
  // ESTADOS DE CARGA
  // ================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Cargando diagnóstico ambiental...
          </p>
        </div>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <p className="text-center text-red-500 mt-10">
        Evaluación no encontrada.
      </p>
    );
  }

  // ================================
  // CÁLCULOS
  // ================================
  const ev = evaluacion;
  const emisionesVista = calcularEmisionesCarbono(ev.carbonData || {});

  const textoRadar = interpretarRadar(ev.scores);
  const textoCarbono = interpretarCarbono(emisionesVista);
  const textoRep = interpretarRep(residuosRep, ev);
  const textoGlobal = analisisGlobal(ev, emisionesVista, residuosRep);

  const nivelColores = {
    Avanzado: "#0284C7",
    Intermedio: "#F59E0B",
    Básico: "#DC2626",
    Bajo: "#7F1D1D",
  };
  const colorNivel = nivelColores[ev.nivel] || "#6B7280";

  // =============================
  // RENDER
  // =============================
  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
      {/* TÍTULO */}
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">
          Detalle del Diagnóstico Ambiental
        </h1>
        <p className="text-sm text-slate-500">
          Resultado consolidado del diagnóstico aplicado a la organización.
        </p>
      </header>

      {/* CARD PRINCIPAL */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 px-6 py-6 space-y-8">

        {/* IDENTIFICACIÓN */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 pb-4 border-b">
          <div>
            <p className="text-xs uppercase text-slate-400">Organización</p>
            <h2 className="text-xl font-semibold">{ev.companyName}</h2>
            <p className="text-sm text-slate-500">
              Período: <strong>{ev.period}</strong>
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div
              className="px-4 py-2.5 rounded-xl border shadow-sm bg-white text-right"
              style={{ borderColor: colorNivel }}
            >
              <p className="text-[11px] uppercase text-slate-400 font-semibold">
                Puntaje global
              </p>
              <p className="text-2xl font-semibold" style={{ color: colorNivel }}>
                {ev.finalScore.toFixed(1)} / 100
              </p>
              <p className="text-xs text-slate-500">
                Nivel:{" "}
                <strong style={{ color: colorNivel }}>{ev.nivel}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* TEXTO EXPLICATIVO */}
        <section className="bg-slate-50 border rounded-xl px-4 py-3">
          <p className="text-xs uppercase text-slate-500 font-semibold">
            Cómo leer este diagnóstico
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mt-1">
            Los puntajes ambientales se construyen a partir de las dimensiones
            <strong> carbono</strong>, <strong>agua</strong> y{" "}
            <strong>residuos</strong> […]
          </p>
        </section>

        {/* BARRA AMBIENTAL */}
        <BarraAmbiental score={ev.finalScore} nivel={ev.nivel} />

        {/* RADAR */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded-xl px-4 py-4 bg-slate-50">
            <h3 className="text-sm font-semibold mb-2">
              Perfil ambiental de la empresa
            </h3>
            <RadarAmbiental scores={ev.scores} />
          </div>

          <div className="border rounded-xl px-4 py-4 bg-white">
            <h4 className="text-sm font-semibold mb-2">Lectura del perfil</h4>
            <p className="text-sm text-slate-700">{textoRadar}</p>
          </div>
        </section>

        {/* KPI */}
        <section>
          <h3 className="text-sm font-semibold">Indicadores clave</h3>
          <IndicadoresAmbientales emisiones={emisionesVista} evaluacion={ev} />
        </section>

        {/* HUELLA CARBONO */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="border rounded-xl px-4 py-4 bg-slate-50">
            <h3 className="text-sm font-semibold mb-2">
              Huella de carbono – Alcances 1 y 2
            </h3>
            <GraficoCarbono evaluacion={ev} />
          </div>

          <div className="border rounded-xl px-4 py-4 bg-white">
            <h4 className="text-sm font-semibold mb-2">
              Interpretación de la huella
            </h4>
            <p className="text-sm text-slate-700">{textoCarbono}</p>
          </div>
        </section>

        {/* LEY REP */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold">Gestión de residuos — Ley REP</h3>

          {repLoaded && residuosRep.length > 0 ? (
            <>
              <div className="border rounded-xl px-4 py-3 bg-slate-50">
                <h4 className="text-xs font-semibold uppercase">
                  Último registro disponible
                </h4>

                {(() => {
                  const r = residuosRep[0];
                  const pct = (r.cantidadValorizada / r.cantidadGenerada) * 100;

                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mt-2">
                      <p><strong>Producto:</strong> {r.producto}</p>
                      <p><strong>Año:</strong> {r.anio}</p>
                      <p><strong>Generado (kg):</strong> {r.cantidadGenerada}</p>
                      <p><strong>Valorizado (kg):</strong> {r.cantidadValorizada}</p>
                      <p><strong>% Valorización:</strong> {pct.toFixed(1)}%</p>
                    </div>
                  );
                })()}
              </div>

              <div className="border rounded-xl px-4 py-3 bg-white">
                <GraficoRep
                  residuosRep={residuosRep}
                  totalResiduosKg={ev.wasteData.residuosTotales}
                />
              </div>

              {/* Evolución si hay más de un año */}
              {(() => {
                const años = [...new Set(residuosRep.map(r => r.anio))].sort();
                if (años.length > 1) {
                  return (
                    <div className="border rounded-xl px-4 py-3 bg-white">
                      <canvas ref={canvasRepLineas} height="140"></canvas>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="border rounded-xl px-4 py-3 bg-white">
                <h4 className="text-sm font-semibold mb-1">
                  Interpretación de la gestión REP
                </h4>
                <p className="text-sm text-slate-700">{textoRep}</p>
              </div>
            </>
          ) : (
            <div className="border bg-amber-50 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-800">
                No hay registros de Ley REP para esta empresa.
              </p>
            </div>
          )}
        </section>

        {/* ANÁLISIS GLOBAL */}
        <section className="border rounded-xl px-4 py-4 bg-white">
          <h3 className="text-sm font-semibold mb-2">Análisis integrado</h3>
          <p className="text-sm text-slate-700">{textoGlobal}</p>
        </section>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={() => navigate("/evaluaciones")}
          className="btn-secondary w-full"
        >
          ← Volver
        </button>

        <button
          onClick={() => navigate(`/pdf/${ev._id}`)}
          className="btn-primary w-full"
        >
          Exportar informe en PDF
        </button>
      </div>
    </div>
  );
}