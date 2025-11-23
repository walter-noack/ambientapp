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
  const canvasCarbonoRef = useRef(null);
  const graficoCarbonoRef = useRef(null);
  const graficoRepBarrasRef = useRef(null);
  const graficoRepLineasRef = useRef(null);

  // ---------------------------------------------------------------------------
  // 📌 Cargar evaluación + registros REP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    console.log("=====REP REGISTROS=====");
    console.table(residuosRep);
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
  }, [id], [residuosRep]);

  // ---------------------------------------------------------------------------
  // 📊 Donut Huella de Carbono (A1 y A2)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!evaluacion) return;

    const canvas = canvasCarbonoRef.current;
    if (!canvas) return;

    // evitar duplicados
    if (graficoCarbonoRef.current) {
      graficoCarbonoRef.current.destroy();
    }

    // esperar dos ciclos para asegurar tamaño real
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});
        const alcance1Ton = emisiones.alcance1 / 1000;
        const alcance2Ton = emisiones.alcance2 / 1000;

        graficoCarbonoRef.current = new Chart(canvas, {
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
            },
          },
        });
      });
    });

    return () => {
      if (graficoCarbonoRef.current) graficoCarbonoRef.current.destroy();
    };
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando diagnóstico ambiental...</p>
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
  // RENDER (diseño B1: minimalista corporativo)
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto px-5 py-8 lg:py-10 space-y-6">
      {/* TÍTULO PRINCIPAL */}
      <header className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
          Detalle del Diagnóstico Ambiental
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Resultado consolidado del diagnóstico aplicado a la organización.
        </p>
      </header>

      {/* CARD PRINCIPAL */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200/80 px-6 py-6 lg:px-8 lg:py-7 space-y-8">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400 font-medium mb-1">
              Organización evaluada
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              {ev.companyName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Período evaluado:{" "}
              <span className="font-medium text-slate-700">{ev.period}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div
              className="px-4 py-2.5 rounded-xl border text-right shadow-sm bg-white"
              style={{ borderColor: colorNivel }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
                Puntaje global
              </p>
              <p
                className="text-2xl font-semibold leading-tight"
                style={{ color: colorNivel }}
              >
                {ev.finalScore.toFixed(1)} / 100
              </p>
              <p className="text-[11px] font-semibold mt-1 text-slate-500">
                Nivel:{" "}
                <span style={{ color: colorNivel }} className="font-bold">
                  {ev.nivel}
                </span>
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
              Diagnóstico Ambiental · AmbientAPP
            </span>
          </div>
        </div>

        {/* EXPLICACIÓN DE CÓMO SE CALCULAN LOS PUNTAJES */}
        <section className="bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3.5">
          <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-[0.16em]">
            Cómo leer este diagnóstico
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Los puntajes ambientales se construyen a partir de tres dimensiones:
            <strong> carbono</strong>, <strong>agua</strong> y <strong>residuos</strong>.
            Cada una recibe un puntaje entre 0 y 100 según el desempeño registrado:
            <br />
            <br />
            • <strong>Carbono</strong>: basado en la huella de carbono estimada en toneladas de CO₂ equivalente (tCO₂e) considerando los <em>Alcances 1 y 2</em>.
            Mientras mayor es la emisión total, menor es el puntaje asignado.
            <br />
            • <strong>Agua</strong>: depende del volumen de consumo hídrico declarado. Consumos más altos reducen el puntaje final.
            <br />
            • <strong>Residuos</strong>: se evalúa el porcentaje de valorización respecto del total de residuos generados. Una valorización alta se traduce en un mejor puntaje.
            <br />
            <br />
            El <strong>puntaje final</strong> corresponde a un promedio ponderado:
            <strong> 40% carbono</strong>, <strong>30% agua</strong> y <strong>30% residuos</strong>,
            permitiendo identificar con claridad las áreas con mejor desempeño y aquellas con mayor potencial de mejora.
          </p>
        </section>

        {/* Barra Ambiental */}
        <section>
          <BarraAmbiental score={ev.finalScore} nivel={ev.nivel} />
        </section>

        {/* ===================== PERFIL AMBIENTAL (RADAR + TEXTO) ===================== */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <div className="border border-slate-100 rounded-xl px-4 py-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Perfil ambiental de la empresa
            </h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              El gráfico radar resume el desempeño en <strong>carbono</strong>,{" "}
              <strong>agua</strong> y <strong>residuos</strong>.
              Valores más cercanos a 100 indican una gestión más consolidada en esa dimensión.
            </p>
            <div className="w-full flex justify-center">
              <div className="max-w-[320px] w-full">
                <RadarAmbiental scores={ev.scores} />
              </div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl px-4 py-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              Lectura del perfil
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {textoRadar}
            </p>
          </div>
        </section>

        {/* ===================== KPIs AMBIENTALES ===================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Indicadores clave de desempeño
            </h3>
            <p className="text-[11px] text-slate-500">
              Valores expresados en tCO₂e, litros y kg según corresponda.
            </p>
          </div>
          <IndicadoresAmbientales emisiones={emisionesVista} evaluacion={ev} />
        </section>

     {/* =====================  INTENSIDAD HÍDRICA  ===================== */}
{evaluacion.waterData?.intensidadValor > 0 && (
  <section className="border border-slate-100 rounded-xl px-4 py-4 bg-slate-50/60">
    <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
      Intensidad hídrica
    </h3>

    <p className="text-xs text-slate-600 leading-relaxed mb-2">
      La intensidad hídrica permite entender el consumo relativo de agua según la
      actividad de la empresa.
    </p>

    <div className="text-sm">
      <p className="text-slate-700">
        <strong>Tipo:</strong> {evaluacion.waterData.intensidadTipo}
      </p>

      <p className="text-slate-700 mt-1">
        <strong>Valor:</strong>{" "}
        {Number(evaluacion.waterData.intensidadValor).toFixed(1)}{" "}
        {evaluacion.waterData.intensidadTipo ===
        "Consumo por unidad de producción"
          ? "L/unidad"
          : "L/persona·día"}
      </p>

      <p className="mt-2 font-medium text-slate-800">
        {evaluacion.waterData.intensidadValor <= 15
          ? "Baja intensidad hídrica: consumo eficiente."
          : evaluacion.waterData.intensidadValor <= 30
          ? "Intensidad moderada."
          : "Alta intensidad hídrica: se recomienda revisar procesos."}
      </p>
    </div>
  </section>
)}


        {/* ========================= HUELLA DE CARBONO ========================= */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-6 items-start">
          <div className="border border-slate-100 rounded-xl px-4 py-4 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
              Huella de carbono – Alcances 1 y 2
            </h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Se muestran los dos alcances obligatorios de reporte según estándar chileno:
              <strong> combustibles (Alcance 1)</strong> y{" "}
              <strong>electricidad (Alcance 2)</strong>.
            </p>

            <div className="w-full flex justify-center">
              <GraficoCarbono evaluacion={ev} />
            </div>

            <div className="flex justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-green-600" />
                Alcance 1 (Combustibles)
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Alcance 2 (Electricidad)
              </div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl px-4 py-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              Interpretación de la huella
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {textoCarbono}
            </p>
          </div>
        </section>

        {/* ===================== LEY REP ===================== */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Gestión de residuos – Ley REP
          </h3>

          {repLoaded && residuosRep.length > 0 ? (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se comparan los residuos totales registrados en el diagnóstico con
                la generación de productos prioritarios bajo Ley REP para el último
                año disponible. Cuando hay más de un año de datos, se muestra también
                la evolución del porcentaje de valorización.
              </p>

              {/* Último registro */}
              <div className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50/60">
                <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-[0.16em]">
                  Último registro disponible REP
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
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
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  Total vs productos prioritarios (kg/año)
                </h4>
                <div className="border border-slate-100 rounded-xl px-3 py-3 bg-white">
                  <GraficoRep
                    residuosRep={residuosRep}
                    totalResiduosKg={ev?.wasteData?.residuosTotales || 0}
                  />
                </div>
              </div>

              {/* Líneas */}
              {(() => {
                const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
                if (años.length > 1) {
                  return (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">
                        Evolución del % de valorización
                      </h4>
                      <div className="border border-slate-100 rounded-xl px-3 py-3 bg-white">
                        <canvas id="graficoRepLinea" height="140"></canvas>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="border border-slate-100 rounded-xl px-4 py-3 bg-white">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  Interpretación de la gestión REP
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {textoRep}
                </p>
              </div>
            </>
          ) : (
            <div className="border border-amber-100 bg-amber-50 rounded-xl px-4 py-3">
              <p className="text-sm text-amber-800">
                No hay registros de Ley REP asociados a esta empresa todavía.
                Se recomienda revisar la obligación de declarar productos prioritarios
                según el rubro y confirmar la inscripción en el sistema de gestión correspondiente.
              </p>
            </div>
          )}
        </section>

        {/* ===================== ANÁLISIS GLOBAL ===================== */}
        <section className="border border-slate-100 rounded-xl px-4 py-4 bg-white">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Análisis integrado y prioridades
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {textoGlobal}
          </p>
        </section>
      </div>

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2 max-w-md mx-auto">
        <button
          onClick={() => navigate("/evaluaciones")}
          className="btn-secondary w-full"
        >
          ← Volver al listado
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