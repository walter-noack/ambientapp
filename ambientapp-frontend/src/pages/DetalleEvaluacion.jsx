// src/pages/DetalleEvaluacion.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getEvaluacionById, getResiduosRep } from "../services/api";
import BarraAmbiental from "../components/BarraAmbiental";
import RadarAmbiental from "../components/graficos/RadarAmbiental";
import IndicadoresAmbientales from "../components/graficos/IndicadoresAmbientales";

import { calcularEmisionesCarbono } from "../utils/calculosHuella";

import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// -----------------------------------------------------------------------------
// 🧠 Funciones de interpretación (nivel consultor)
// -----------------------------------------------------------------------------
function interpretarRadar(scores) {
  if (!scores) {
    return "Aún no se han calculado los puntajes ambientales para esta evaluación.";
  }

  const carbon = scores.carbonScore ?? 0;
  const agua = scores.waterScore ?? 0;
  const residuos = scores.wasteScore ?? 0;

  const dimensiones = [
    { clave: "carbono", label: "Huella de carbono", valor: carbon },
    { clave: "agua", label: "Gestión hídrica", valor: agua },
    { clave: "residuos", label: "Gestión de residuos", valor: residuos },
  ];

  const ordenadas = [...dimensiones].sort((a, b) => b.valor - a.valor);
  const mejor = ordenadas[0];
  const peor = ordenadas[ordenadas.length - 1];

  return `El perfil ambiental muestra un mejor desempeño en ${mejor.label.toLowerCase()} (${mejor.valor} pts), mientras que la principal oportunidad de mejora se encuentra en ${peor.label.toLowerCase()} (${peor.valor} pts). Estos resultados permiten priorizar acciones correctivas y de inversión en el corto plazo.`;
}

function interpretarCarbono(emisiones) {
  const { totalTon, alcance1, alcance2 } = emisiones;
  if (!totalTon || totalTon <= 0) {
    return "No se registran consumos de combustibles ni electricidad para el período evaluado. Se recomienda revisar la calidad de la información de entrada.";
  }

  const totalKg = alcance1 + alcance2 || 1;
  const p1 = (alcance1 / totalKg) * 100;
  const p2 = (alcance2 / totalKg) * 100;

  let foco = "";
  if (p1 > p2 + 10) {
    foco =
      "La mayor contribución proviene de fuentes de combustibles (Alcance 1), por lo que el foco de trabajo debe estar en eficiencia de flota, calderas y procesos térmicos.";
  } else if (p2 > p1 + 10) {
    foco =
      "La mayor contribución proviene del consumo eléctrico (Alcance 2), por lo que resulta clave revisar tarifas, eficiencia energética y alternativas de energía renovable.";
  } else {
    foco =
      "Las emisiones se distribuyen de forma relativamente equilibrada entre combustibles (Alcance 1) y electricidad (Alcance 2), lo que abre espacio para medidas combinadas de eficiencia y cambio tecnológico.";
  }

  return `La huella de carbono total estimada para el período es de ${totalTon.toFixed(
    2
  )} tCO₂e. Aproximadamente ${p1.toFixed(
    1
  )}% corresponde a emisiones de combustibles (Alcance 1) y ${p2.toFixed(
    1
  )}% a consumo de electricidad (Alcance 2). ${foco}`;
}

function interpretarRep(residuosRep, evaluacion) {
  if (!residuosRep || residuosRep.length === 0) {
    return "Aún no se registran datos de productos prioritarios bajo la Ley REP para esta empresa. Se recomienda levantar una línea base de generación y valorización por producto prioritario.";
  }

  const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
  const ultimoAnio = años[años.length - 1];

  const registrosUltimo = residuosRep.filter((r) => r.anio === ultimoAnio);
  const promedioVal =
    registrosUltimo.reduce(
      (sum, r) => sum + (r.porcentajeValorizacion || 0),
      0
    ) / (registrosUltimo.length || 1);

  let lectura = "";
  if (promedioVal >= 55) {
    lectura =
      "El porcentaje de valorización se encuentra en un nivel alto respecto a estándares habituales del sector, lo que indica una gestión de residuos prioritarios madura.";
  } else if (promedioVal >= 30) {
    lectura =
      "El porcentaje de valorización se ubica en un rango intermedio. Existen avances relevantes, pero todavía hay espacio para fortalecer acuerdos con gestores y mejorar la segregación en origen.";
  } else {
    lectura =
      "El porcentaje de valorización es bajo para el año analizado. Es prioritario revisar contratos, procesos de separación y cumplimiento de metas asociadas a la Ley REP.";
  }

  const totalResiduosKg = evaluacion?.wasteData?.residuosTotales || 0;

  return `Para el año ${ultimoAnio}, el porcentaje promedio de valorización de productos prioritarios alcanza aproximadamente ${promedioVal.toFixed(
    1
  )}%. Considerando un total de ${totalResiduosKg.toLocaleString(
    "es-CL"
  )} kg de residuos generados, la gestión bajo Ley REP debe alinearse de manera consistente con las metas y obligaciones del sistema de gestión contratado. ${lectura}`;
}

function analisisGlobal(evaluacion, emisiones, residuosRep) {
  if (!evaluacion || !evaluacion.scores) {
    return "No se dispone de información suficiente para elaborar un análisis integrado de desempeño ambiental.";
  }

  const { finalScore, nivel, scores } = evaluacion;
  const { carbonScore, waterScore, wasteScore } = scores;

  const fortalezas = [];
  const oportunidades = [];

  if (waterScore >= 60) fortalezas.push("Gestión hídrica");
  else oportunidades.push("Consumo y gestión del recurso hídrico");

  if (wasteScore >= 60) fortalezas.push("Gestión y valorización de residuos");
  else oportunidades.push("Valorización y segregación de residuos");

  if (carbonScore >= 60) fortalezas.push("Huella de carbono");
  else oportunidades.push("Eficiencia energética y combustibles fósiles");

  const resumenFortalezas =
    fortalezas.length > 0
      ? `Fortalezas principales: ${fortalezas.join(", ")}.`
      : "No se identifican fortalezas ambientales destacadas; todas las dimensiones presentan oportunidades de mejora.";

  const resumenOportunidades =
    oportunidades.length > 0
      ? `Oportunidades de mejora: ${oportunidades.join(", ")}.`
      : "Las tres dimensiones muestran un desempeño ambiental sólido, por lo que las oportunidades se orientan principalmente a la optimización continua.";

  const textoNivel = `El puntaje global obtenido es de ${finalScore.toFixed(
    1
  )}/100, lo que ubica a la organización en un nivel **${nivel}** de desempeño ambiental.`;

  const tieneRep = residuosRep && residuosRep.length > 0;
  const focoRep = tieneRep
    ? "Dado que existen registros de Ley REP, es importante mantener un seguimiento anual de las metas de valorización y asegurar coherencia entre los reportes internos y los sistemas de gestión externos."
    : "Al no contar aún con registros REP, se recomienda definir un plan de trabajo para identificar productos prioritarios, volúmenes y obligaciones asociadas.";

  return `${textoNivel} ${resumenFortalezas} ${resumenOportunidades} ${focoRep}`;
}

// -----------------------------------------------------------------------------
// 🌿 COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
export default function DetalleEvaluacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ley REP
  const [residuosRep, setResiduosRep] = useState([]);
  const [repLoaded, setRepLoaded] = useState(false);

  // Refs para gráficos Chart.js
  const graficoCarbonoRef = useRef(null);
  const graficoRepBarrasRef = useRef(null);
  const graficoRepLineasRef = useRef(null);

  // ---------------------------------------------------------------------------
  // 📌 Cargar evaluación + registros REP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluacionById(id);
        setEvaluacion(data);

        const empresaBase =
          data?.empresaId && data?.empresaId !== "null"
            ? data.empresaId
            : "EMPRESA_ADMIN";

        const repResponse = await getResiduosRep(empresaBase);
        setResiduosRep(repResponse.data || []);
        setRepLoaded(true);
      } catch (error) {
        console.error("Error cargando evaluación:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ---------------------------------------------------------------------------
  // 📊 Donut Huella de Carbono (A1 y A2)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!evaluacion) return;

    const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});
    if (!emisiones) return;

    const alcance1Ton = emisiones.alcance1 / 1000;
    const alcance2Ton = emisiones.alcance2 / 1000;

    if (graficoCarbonoRef.current) graficoCarbonoRef.current.destroy();

    const canvas = document.getElementById("graficoCarbono");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    graficoCarbonoRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Alcance 1", "Alcance 2"],
        datasets: [
          {
            data: [alcance1Ton, alcance2Ton],
            backgroundColor: ["#16a34a", "#3b82f6"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label;
                const d = emisiones.detalle;

                if (label === "Alcance 1") {
                  return [
                    `Alcance 1: ${alcance1Ton.toFixed(2)} tCO₂e`,
                    `• Diésel: ${(d.diesel / 1000).toFixed(2)} t`,
                    `• Bencina: ${(d.bencina / 1000).toFixed(2)} t`,
                    `• Gas Natural: ${(d.gasNatural / 1000).toFixed(2)} t`,
                  ];
                }
                return [
                  `Alcance 2: ${alcance2Ton.toFixed(2)} tCO₂e`,
                  `• Electricidad: ${(d.electricidad / 1000).toFixed(2)} t`,
                ];
              },
            },
          },
        },
      },
    });
  }, [evaluacion]);

  // ---------------------------------------------------------------------------
  // 📊 Gráficos Ley REP (barras + líneas)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!repLoaded || residuosRep.length === 0 || !evaluacion) return;

    if (graficoRepBarrasRef.current) graficoRepBarrasRef.current.destroy();
    if (graficoRepLineasRef.current) graficoRepLineasRef.current.destroy();

    const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
    const productos = [...new Set(residuosRep.map((r) => r.producto))];

    const ultimoAnio = años[años.length - 1];
    const totalResiduosKg = evaluacion?.wasteData?.residuosTotales || 0;

    const porProductoUltimo = productos.map((prod) => {
      const registros = residuosRep.filter(
        (r) => r.anio === ultimoAnio && r.producto === prod
      );
      return registros.reduce((sum, r) => sum + (r.cantidadGenerada || 0), 0);
    });

    // Barras
    const canvasBarras = document.getElementById("graficoRepBarras");
    if (canvasBarras) {
      graficoRepBarrasRef.current = new Chart(
        canvasBarras.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: ["Total residuos", ...productos],
            datasets: [
              {
                label: `Generación de residuos ${ultimoAnio} (kg)`,
                data: [totalResiduosKg, ...porProductoUltimo],
                backgroundColor: ["#0f766e", ...productos.map(() => "#22c55e")],
                borderRadius: 6,
              },
            ],
          },
          options: {
            maintainAspectRatio: true,
            plugins: {
              legend: { display: true, position: "bottom" },
              datalabels: { display: false },
            },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
            },
          },
        }
      );
    }

    // Líneas
    if (años.length > 1) {
      const canvasLineas = document.getElementById("graficoRepLinea");
      if (canvasLineas) {
        const porcentajePorAnio = años.map((a) => {
          const registros = residuosRep.filter((r) => r.anio === a);
          if (registros.length === 0) return 0;
          const suma = registros.reduce(
            (sum, r) => sum + (r.porcentajeValorizacion || 0),
            0
          );
          return suma / registros.length;
        });

        graficoRepLineasRef.current = new Chart(
          canvasLineas.getContext("2d"),
          {
            type: "line",
            data: {
              labels: años,
              datasets: [
                {
                  label: "% valorización promedio",
                  data: porcentajePorAnio,
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
          }
        );
      }
    }
  }, [repLoaded, residuosRep, evaluacion]);

  // ---------------------------------------------------------------------------
  // Estados de carga
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando evaluación...</p>
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

  const ev = evaluacion;
  const emisionesVista = calcularEmisionesCarbono(ev.carbonData || {});
  const totalTonVista = emisionesVista.totalTon;

  const nivelColores = {
    Avanzado: "#0284C7",
    Intermedio: "#F59E0B",
    Básico: "#DC2626",
    Bajo: "#7F1D1D",
  };
  const colorNivel = nivelColores[ev.nivel] || "#6B7280";

  const textoRadar = interpretarRadar(ev.scores);
  const textoCarbono = interpretarCarbono(emisionesVista);
  const textoRep = interpretarRep(residuosRep, ev);
  const textoGlobal = analisisGlobal(ev, emisionesVista, residuosRep);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* TÍTULO */}
      <h1 className="text-3xl font-bold text-slate-800">Detalle de Evaluación</h1>

      <div className="bg-white shadow-md rounded-xl p-6 border border-slate-200 space-y-10">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{ev.companyName}</h2>
            <p className="text-slate-600">Periodo: {ev.period}</p>
          </div>

          <div
            className="px-4 py-3 rounded-xl border text-right shadow-sm bg-slate-50"
            style={{ borderColor: colorNivel }}
          >
            <p className="text-sm text-slate-500">Puntaje final</p>
            <p className="text-xl font-bold" style={{ color: colorNivel }}>
              {ev.finalScore} / 100
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: colorNivel }}>
              Nivel {ev.nivel}
            </p>
          </div>
        </div>
        {/* EXPLICACIÓN DE CÓMO SE CALCULAN LOS PUNTAJES */}
        <div className="bg-slate-50 border rounded-xl p-4 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800">
            ¿Cómo se obtuvieron estos resultados?
          </h3> <br />
          <p className="text-sm text-slate-700 leading-relaxed">
            Los puntajes ambientales se calculan considerando tres dimensiones clave:
            <strong> carbono</strong>, <strong>agua</strong> y <strong>residuos</strong>.
            Cada una recibe un puntaje entre 0 y 100 según el desempeño registrado:
            <br /><br />
            • <strong>Carbono</strong>: basado en la huella de carbono estimada en toneladas de CO₂ equivalente (tCO₂e) considerando los <em>Alcances 1 y 2</em>. Mientras mayor es la emisión total, menor es el puntaje asignado.<br />
            • <strong>Agua</strong>: depende del volumen de consumo hídrico declarado. Consumos más altos reducen el puntaje final.<br />
            • <strong>Residuos</strong>: se evalúa el porcentaje de valorización respecto del total de residuos generados. Una valorización alta se traduce en un mejor puntaje.<br /><br />
            El <strong>puntaje final</strong> corresponde a un promedio ponderado:
            <strong> 40% carbono</strong>, <strong>30% agua</strong> y <strong>30% residuos</strong>.
            Estas ponderaciones permiten identificar con claridad las áreas donde la empresa presenta mejor desempeño y aquellas donde existen mayores oportunidades de mejora.
          </p>
        </div>

        {/* Barra Ambiental */}
        <BarraAmbiental score={ev.finalScore} nivel={ev.nivel} />

        {/* ===================== PERFIL AMBIENTAL (RADAR + TEXTO) ===================== */}
        <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-800">
            Perfil Ambiental de la Empresa
          </h3>
          <p className="text-sm text-slate-600">
            El radar sintetiza el desempeño ambiental en las tres dimensiones
            evaluadas: carbono, agua y residuos. Valores más altos indican una
            mejor gestión relativa en cada eje.
          </p>

          <div className="w-full flex justify-center">
            <div className="max-w-[360px] w-full">
              <RadarAmbiental scores={ev.scores} />
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {textoRadar}
          </p>
        </div>

        {/* ===================== KPIs AMBIENTALES ===================== */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-800">
            Indicadores clave de desempeño
          </h3>
          <IndicadoresAmbientales emisiones={emisionesVista} evaluacion={ev} />
        </div>

        {/* ========================= HUELLA DE CARBONO ========================= */}
        <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-800">
            Huella de Carbono – Alcances 1 y 2
          </h3>
          <p className="text-sm text-slate-600">
            Se presentan los dos alcances obligatorios de reporte según el
            estándar chileno: combustibles (Alcance 1) y electricidad (Alcance 2).
          </p>

          <div className="w-full flex justify-center">
            <div className="max-w-[250px] w-full relative">
              <canvas id="graficoCarbono"></canvas>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-800">
                  {totalTonVista.toFixed(2)} tCO₂e
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600" />
              Alcance 1 (Combustibles)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Alcance 2 (Electricidad)
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {textoCarbono}
          </p>
        </div>

        {/* ===================== LEY REP ===================== */}
        <div className="p-6 bg-slate-50 rounded-xl border shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-800">
            Gestión de Residuos – Ley REP
          </h3>

          {repLoaded && residuosRep.length > 0 ? (
            <>
              <p className="text-sm text-slate-600">
                Se comparan los residuos totales registrados en la evaluación con
                la generación de productos prioritarios bajo Ley REP para el
                último año disponible. Cuando existen registros de más de un año,
                se muestra además la evolución del porcentaje de valorización.
              </p>

              {/* Último registro */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Último registro disponible
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <p>
                    <strong>Producto:</strong> {residuosRep[0].producto}
                  </p>
                  <p>
                    <strong>Año:</strong> {residuosRep[0].anio}
                  </p>
                  <p>
                    <strong>Generado (kg):</strong>{" "}
                    {residuosRep[0].cantidadGenerada}
                  </p>
                  <p>
                    <strong>Valorizado (kg):</strong>{" "}
                    {residuosRep[0].cantidadValorizada}
                  </p>
                  <p>
                    <strong>% Valorización:</strong>{" "}
                    {residuosRep[0].porcentajeValorizacion.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Barras */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Total vs Productos Prioritarios (kg/año)
                </h4>
                <canvas id="graficoRepBarras" height="180"></canvas>
              </div>

              {/* Líneas */}
              {(() => {
                const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
                if (años.length > 1) {
                  return (
                    <div className="mb-2">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        Evolución del % de valorización
                      </h4>
                      <canvas id="graficoRepLinea" height="140"></canvas>
                    </div>
                  );
                }
                return null;
              })()}

              <p className="text-sm text-slate-700 leading-relaxed">
                {textoRep}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No hay registros de Ley REP asociados a esta empresa todavía.
            </p>
          )}
        </div>

        {/* ===================== ANÁLISIS GLOBAL ===================== */}
        <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300">
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Análisis integrado y prioridades
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {textoGlobal}
          </p>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col gap-3 mt-4 max-w-sm mx-auto">
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
          Exportar PDF
        </button>
      </div>
    </div>
  );
}