// src/utils/generarPDF.js

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { calcularEmisionesCarbono } from "./calculosHuella";
import { getResiduosRep } from "../services/api";

Chart.register(ChartDataLabels);

export default async function generarPDF(evaluacion) {
  if (!evaluacion) {
    console.error("No se recibió evaluación en generarPDF.");
    return;
  }

  // Limpia cualquier informe anterior
  const old = document.getElementById("informe-pdf");
  if (old) old.remove();

  // -----------------------------------------------------------
  // 1. DATOS BÁSICOS
  // -----------------------------------------------------------
  const coloresNivel = {
    Avanzado: "#0284C7",
    Intermedio: "#F59E0B",
    Básico: "#DC2626",
    Bajo: "#7F1D1D",
  };
  const colorNivel = coloresNivel[evaluacion.nivel] || "#6B7280";

  const carbonScore = Number(evaluacion.scores?.carbonScore ?? 0);
  const waterScore = Number(evaluacion.scores?.waterScore ?? 0);
  const wasteScore = Number(evaluacion.scores?.wasteScore ?? 0);

  const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});
  const { totalTon, alcance1, alcance2 } = emisiones;

  // Valores “reales” que mostraremos como resumen
  const carbonoTon = totalTon * 1000; // en kg
  const aguaLitros = Number(
    evaluacion?.waterData?.consumoMensual ??
    evaluacion?.resultadosHuella?.agua?.consumoLitros ??
    0
  );
  const residuosKg = Number(
    evaluacion?.wasteData?.residuosTotales ??
    evaluacion?.resultadosHuella?.residuos?.residuosTotalesKg ??
    0
  );

  // REP (traemos desde backend si hay empresa asociada)
  let repRegistros = [];
  try {
    const empresaBase =
      evaluacion?.empresaId && evaluacion.empresaId !== "null"
        ? evaluacion.empresaId
        : "EMPRESA_ADMIN";

    if (empresaBase) {
      const repResponse = await getResiduosRep(empresaBase);
      repRegistros = repResponse.data || [];
    }
  } catch (err) {
    console.warn("No se pudo cargar Ley REP para el PDF:", err);
  }

  // -----------------------------------------------------------
  // 2. CREAR CANVAS DE GRÁFICOS (RADAR, DONUT, REP)
  // -----------------------------------------------------------
  const chartContainer = document.createElement("div");
  chartContainer.style.position = "fixed";
  chartContainer.style.left = "-9999px";
  chartContainer.style.top = "0";
  chartContainer.style.width = "900px";
  chartContainer.style.background = "#fff";
  document.body.appendChild(chartContainer);

  // --- Radar Ambiental ---
  const radarCanvas = document.createElement("canvas");
  radarCanvas.width = 260;
  radarCanvas.height = 260;
  chartContainer.appendChild(radarCanvas);

  const radarChart = new Chart(radarCanvas.getContext("2d"), {
    type: "radar",
    data: {
      labels: ["Carbono", "Agua", "Residuos"],
      datasets: [
        {
          label: "Puntaje",
          data: [carbonScore, waterScore, wasteScore],
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          borderColor: "#2563EB",
          borderWidth: 2,
          pointBackgroundColor: "#1D4ED8",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          color: "#111827",
          font: { size: 11, weight: "bold" },
          formatter: (value) => `${value}`,
        },
      },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            display: false,
            stepSize: 20,
          },
          grid: {
            color: "#E5E7EB",
          },
          angleLines: {
            color: "#E5E7EB",
          },
          pointLabels: {
            font: { size: 11, weight: "600" },
            color: "#374151",
          },
        },
      },
    },
  });

  // --- Donut Huella Carbono A1/A2 ---
  const donutCanvas = document.createElement("canvas");
  donutCanvas.width = 260;
  donutCanvas.height = 260;
  chartContainer.appendChild(donutCanvas);

  const a1Ton = alcance1 / 1000;
  const a2Ton = alcance2 / 1000;
  const totalTonDonut = a1Ton + a2Ton || 1;

  const donutChart = new Chart(donutCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["A1 Combustibles", "A2 Electricidad"],
      datasets: [
        {
          data: [a1Ton, a2Ton],
          backgroundColor: ["#16a34a", "#3b82f6"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: "60%",
      animation: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          color: "#111827",
          font: { size: 11, weight: "bold" },
          formatter: (value) => {
            const pct = (value / totalTonDonut) * 100;
            return `${pct.toFixed(1)}%`;
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label;
              const value = ctx.raw;
              return `${label}: ${value.toFixed(2)} tCO₂e`;
            },
          },
        },
      },
    },
  });

  // --- Gráfico REP (Barras) si hay registros ---
  let repBarImage = null;

  if (repRegistros.length > 0) {
    const repCanvas = document.createElement("canvas");
    repCanvas.width = 320;
    repCanvas.height = 220;
    chartContainer.appendChild(repCanvas);

    const años = [...new Set(repRegistros.map((r) => r.anio))].sort();
    const ultimoAnio = años[años.length - 1];

    const productos = [
      ...new Set(
        repRegistros
          .filter((r) => r.anio === ultimoAnio)
          .map((r) => r.producto)
      ),
    ];

    const totalResiduos = residuosKg || 0;
    const datosProductos = productos.map((prod) => {
      const registrosProd = repRegistros.filter(
        (r) => r.anio === ultimoAnio && r.producto === prod
      );
      return registrosProd.reduce(
        (sum, r) => sum + (r.cantidadGenerada || 0),
        0
      );
    });

    const repBarChart = new Chart(repCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Total residuos", ...productos],
        datasets: [
          {
            label: `Generación de residuos ${ultimoAnio} (kg)`,
            data: [totalResiduos, ...datosProductos],
            backgroundColor: ["#0f766e", ...productos.map(() => "#22c55e")],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: { size: 9 },
              padding: 8,
            },
          },
          datalabels: { display: false },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 9 },
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 9 },
            },
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    repBarImage = repCanvas.toDataURL("image/png");
    repBarChart.destroy();
  }

  // Esperamos a que TODOS los charts se dibujen bien
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const radarImage = radarCanvas.toDataURL("image/png");
  const donutImage = donutCanvas.toDataURL("image/png");

  radarChart.destroy();
  donutChart.destroy();
  chartContainer.remove();

  // -----------------------------------------------------------
  // 3. CONTENEDORES DE PÁGINA (PAGE1 + PAGE2)
  // -----------------------------------------------------------
  const root = document.createElement("div");
  root.id = "informe-pdf";
  root.style.position = "absolute";
  root.style.top = "-9999px";
  root.style.left = "-9999px";
  root.style.width = "780px";
  root.style.background = "white";
  root.style.fontFamily = "Arial, sans-serif";
  root.style.lineHeight = "1.45";
  document.body.appendChild(root);

  const page1 = document.createElement("div");
  page1.style.width = "780px";
  page1.style.padding = "32px 40px 36px 40px";
  page1.style.boxSizing = "border-box";
  root.appendChild(page1);

  const page2 = document.createElement("div");
  page2.style.width = "780px";
  page2.style.padding = "32px 40px 40px 40px";
  page2.style.boxSizing = "border-box";
  root.appendChild(page2);

  // -----------------------------------------------------------
  // PAGE 1: ENCABEZADO, PERFIL, GRÁFICOS
  // -----------------------------------------------------------

  // -------- Encabezado --------
  const header = document.createElement("div");
  header.style.position = "relative";
  header.style.marginBottom = "18px";

  header.innerHTML = `
    <h1 style="font-size:20px; margin:0; font-weight:bold;">
      ${evaluacion.companyName}
    </h1>
    <p style="color:#555; font-size:10px; margin-top:4px; margin-bottom:0;">
      Diagnóstico Ambiental – Período evaluado: <strong>${evaluacion.period}</strong>
    </p>
  `;
  page1.appendChild(header);

  const scoreBox = document.createElement("div");
  scoreBox.style.cssText = `
    position:absolute; 
    right:0;
    top:0;
    border:2px solid ${colorNivel};
    border-radius:12px;
    padding:8px 14px;
    text-align:right;
  `;
  scoreBox.innerHTML = `
    <div style="font-size:16px; font-weight:bold; color:${colorNivel};">
      ${evaluacion.finalScore} / 100
    </div>
    <div style="font-size:10px; margin-top:2px; font-weight:bold;
                color:${colorNivel}; text-transform:uppercase;">
      ${evaluacion.nivel}
    </div>
  `;
  header.appendChild(scoreBox);

  // -------- Barra de nivel --------
  const barraNivel = document.createElement("div");
  barraNivel.style.marginTop = "10px";
  barraNivel.innerHTML = `
    <div style="font-weight:bold; margin-bottom:6px; font-size:11px;">
      Nivel Ambiental Global
    </div>
    <div style="
      width:100%;
      display:flex;
      height:22px;
      border-radius:999px;
      overflow:hidden;
      font-size:10px;
      font-weight:600;
    ">
      <div style="flex:1; background:#FCA5A5; color:#7F1D1D;
                  display:flex; align-items:center; justify-content:center;">
        Bajo
      </div>
      <div style="flex:1; background:#FECACA; color:#B91C1C;
                  display:flex; align-items:center; justify-content:center;">
        Básico
      </div>
      <div style="flex:1; background:#FDE68A; color:#92400E;
                  display:flex; align-items:center; justify-content:center;">
        Intermedio
      </div>
      <div style="flex:1; background:#BFDBFE; color:#1D4ED8;
                  display:flex; align-items:center; justify-content:center;">
        Avanzado
      </div>
    </div>
    <div style="position:relative; height:14px; width:100%;">
      <div style="
        position:absolute;
        top:-3px;
        left: calc(${evaluacion.finalScore}% - 7px);
        width:0;
        height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-bottom:12px solid ${colorNivel};
      "></div>
    </div>
  `;
  page1.appendChild(barraNivel);

  // -------- Cómo se calculan --------
  const explicacion = document.createElement("p");
  explicacion.style.fontSize = "10px";
  explicacion.style.color = "#374151";
  explicacion.style.marginTop = "10px";
  explicacion.style.marginBottom = "12px";
  explicacion.innerHTML = `
    El puntaje se construye a partir de tres dimensiones: <strong>Carbono</strong>, 
    <strong>Agua</strong> y <strong>Residuos</strong>. Cada área se evalúa en función de 
    sus consumos, registros y prácticas de gestión. Luego, estos puntajes se combinan 
    ponderadamente para obtener un <strong>nivel ambiental global</strong>.
  `;
  page1.appendChild(explicacion);

  // -------- PERFIL + TARJETAS KPI --------
  const perfilWrapper = document.createElement("div");
  perfilWrapper.style.display = "flex";
  perfilWrapper.style.gap = "16px";
  perfilWrapper.style.marginTop = "8px";
  perfilWrapper.style.marginBottom = "10px";
  page1.appendChild(perfilWrapper);

  // --- Columna izquierda: Radar ---
  const perfilColLeft = document.createElement("div");
  perfilColLeft.style.flex = "1";
  perfilColLeft.style.background = "#F9FAFB";
  perfilColLeft.style.borderRadius = "16px";
  perfilColLeft.style.border = "1px solid #E5E7EB";
  perfilColLeft.style.padding = "12px 14px";

  perfilColLeft.innerHTML = `
    <h2 style="font-size:14px; margin:0 0 4px 0; font-weight:bold;">
      Perfil Ambiental de la Empresa
    </h2>
    <p style="font-size:10px; color:#4B5563; margin:0 0 8px 0;">
      El radar muestra el equilibrio relativo entre <strong>Carbono</strong>, 
      <strong>Agua</strong> y <strong>Residuos</strong>. Valores cercanos a 100 
      indican una gestión más robusta en esa categoría.
    </p>
  `;

  const radarImgEl = document.createElement("img");
  radarImgEl.src = radarImage;
  radarImgEl.style.display = "block";
  radarImgEl.style.margin = "0 auto";
  radarImgEl.style.width = "220px";
  radarImgEl.style.height = "220px";
  perfilColLeft.appendChild(radarImgEl);
  perfilWrapper.appendChild(perfilColLeft);

  // --- Columna derecha: KPIs (6 tarjetas, 3x2) ---
  const perfilColRight = document.createElement("div");
  perfilColRight.style.flex = "1.1";
  perfilColRight.style.display = "grid";
  perfilColRight.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  perfilColRight.style.gap = "8px";

  const kpis = [
    {
      titulo: "Puntaje de Carbono",
      valor: `${carbonScore} pts`,
      color: "#DC2626",
      detalle:
        "Refleja el nivel de control sobre emisiones directas e indirectas.",
    },
    {
      titulo: "Puntaje de Agua",
      valor: `${waterScore} pts`,
      color: "#2563EB",
      detalle:
        "Evalúa consumo hídrico y presencia de acciones de eficiencia.",
    },
    {
      titulo: "Puntaje de Residuos",
      valor: `${wasteScore} pts`,
      color: "#059669",
      detalle:
        "Considera generación, separación y valorización de residuos.",
    },
    {
      titulo: "Huella de Carbono Total",
      valor:
        carbonoTon > 0
          ? `${carbonoTon.toLocaleString("es-CL", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} kgCO₂e`
          : "—",
      color: "#111827",
      detalle: "Suma de emisiones A1 y A2 para el período evaluado.",
    },
    {
      titulo: "Alcance 1 (Combustibles)",
      valor: `${(alcance1 / 1000).toFixed(2)} tCO₂e`,
      color: "#16A34A",
      detalle:
        "Emisiones directas por combustibles (flota, calderas, procesos térmicos).",
    },
    {
      titulo: "Alcance 2 (Electricidad)",
      valor: `${(alcance2 / 1000).toFixed(2)} tCO₂e`,
      color: "#3B82F6",
      detalle: "Emisiones asociadas al consumo eléctrico de la operación.",
    },
  ];

  kpis.forEach((kpi) => {
    const card = document.createElement("div");
    card.style.background = "#FFFFFF";
    card.style.border = "1px solid #E5E7EB";
    card.style.borderRadius = "12px";
    card.style.padding = "8px 10px";

    card.innerHTML = `
      <div style="font-size:10px; font-weight:bold; margin-bottom:2px;">
        ${kpi.titulo}
      </div>
      <div style="font-size:12px; font-weight:bold; color:${kpi.color}; margin-bottom:2px;">
        ${kpi.valor}
      </div>
      <div style="font-size:9px; color:#6B7280;">
        ${kpi.detalle}
      </div>
    `;
    perfilColRight.appendChild(card);
  });

  perfilWrapper.appendChild(perfilColRight);

  // -------- HUELLA CARBONO + LEY REP --------
  const graficosRow = document.createElement("div");
  graficosRow.style.display = "flex";
  graficosRow.style.gap = "16px";
  graficosRow.style.marginTop = "6px";
  graficosRow.style.marginBottom = "6px";
  page1.appendChild(graficosRow);

  // --- Donut A1/A2 ---
  const huellaCard = document.createElement("div");
  huellaCard.style.flex = "1";
  huellaCard.style.borderRadius = "16px";
  huellaCard.style.border = "1px solid #E5E7EB";
  huellaCard.style.padding = "12px 14px";
  huellaCard.style.background = "#F9FAFB";

  huellaCard.innerHTML = `
    <h3 style="font-size:13px; margin:0 0 4px 0; font-weight:bold;">
      Huella de Carbono – Alcances 1 y 2
    </h3>
    <p style="font-size:9.5px; color:#4B5563; margin:0 0 8px 0;">
      Se presenta la proporción entre emisiones directas por combustibles (A1) y 
      emisiones indirectas por consumo eléctrico (A2), calculadas con factores de emisión 
      oficiales de Chile 2023.
    </p>
  `;
  const donutImgEl = document.createElement("img");
  donutImgEl.src = donutImage;
  donutImgEl.style.display = "block";
  donutImgEl.style.margin = "0 auto 4px auto";
  donutImgEl.style.width = "220px";
  donutImgEl.style.height = "220px";
  huellaCard.appendChild(donutImgEl);

  const textoTotal = document.createElement("p");
  textoTotal.style.fontSize = "9.5px";
  textoTotal.style.textAlign = "center";
  textoTotal.style.margin = "0";
  textoTotal.innerHTML = `
    Total: <strong>${totalTon.toFixed(2)} tCO₂e</strong> 
    (${a1Ton.toFixed(2)} t A1 · ${a2Ton.toFixed(2)} t A2)
  `;
  huellaCard.appendChild(textoTotal);

  graficosRow.appendChild(huellaCard);

  // --- Ley REP ---
  const repCard = document.createElement("div");
  repCard.style.flex = "1";
  repCard.style.borderRadius = "16px";
  repCard.style.border = "1px solid #E5E7EB";
  repCard.style.padding = "12px 14px";
  repCard.style.background = "#F9FAFB";

  repCard.innerHTML = `
    <h3 style="font-size:13px; margin:0 0 4px 0; font-weight:bold;">
      Gestión de Residuos – Ley REP
    </h3>
  `;

  if (repRegistros.length > 0 && repBarImage) {
    const pDesc = document.createElement("p");
    pDesc.style.fontSize = "9.5px";
    pDesc.style.color = "#4B5563";
    pDesc.style.margin = "0 0 8px 0";
    pDesc.innerHTML = `
      Se compara la generación total de residuos declarada en el diagnóstico con los
      productos prioritarios reportados al sistema REP para el último año disponible.
    `;
    repCard.appendChild(pDesc);

    const imgRep = document.createElement("img");
    imgRep.src = repBarImage;
    imgRep.style.display = "block";
    imgRep.style.margin = "0 auto";
    imgRep.style.width = "260px";
    imgRep.style.height = "180px";
    repCard.appendChild(imgRep);
  } else {
    const pNoData = document.createElement("p");
    pNoData.style.fontSize = "9.5px";
    pNoData.style.color = "#6B7280";
    pNoData.style.margin = "4px 0 0 0";
    pNoData.textContent =
      "No se encontraron registros REP asociados a esta empresa en el sistema al momento del diagnóstico.";
    repCard.appendChild(pNoData);
  }

  graficosRow.appendChild(repCard);

  // Footer página 1
  const footer1 = document.createElement("p");
  footer1.style.marginTop = "8px";
  footer1.style.textAlign = "center";
  footer1.style.fontSize = "9px";
  footer1.style.color = "#9CA3AF";
  footer1.textContent = "Página 1 de 2 — Diagnóstico generado con AmbientAPP";
  page1.appendChild(footer1);

  // -----------------------------------------------------------
  // PAGE 2: ANÁLISIS DETALLADO – PÁGINA 2
  // -----------------------------------------------------------

  const analisisWrapper = document.createElement("div");
  analisisWrapper.style.marginTop = "10px";
  analisisWrapper.style.pageBreakBefore = "always"; // salto forzado a página 2

  // ===========================================================
  // 6.1 PUNTAJE (Gestión Técnica)
  // ===========================================================
  const secPuntaje = document.createElement("div");
  secPuntaje.style.marginBottom = "16px";

  secPuntaje.innerHTML = `
  <h2 style="font-size:14px; font-weight:bold; margin-bottom:6px;">
    1. Análisis del Puntaje (Gestión Técnica)
  </h2>

  <p style="font-size:10px; margin:0 0 6px 0; line-height:1.45; color:#444;">
    El puntaje técnico refleja el nivel de gestión ambiental declarado por la empresa,
    considerando registro, control operacional y buenas prácticas en 
    <strong>Carbono</strong>, <strong>Agua</strong> y <strong>Residuos</strong>. 
    Puntajes más altos indican procesos más consolidados y trazables, mientras que valores bajos
    reflejan brechas de gestión que deben priorizarse.
  </p>

  <p style="font-size:10px; margin:0 0 6px 0; color:#444;">
    • Un puntaje bajo indica ausencia de registros, falta de responsables o escasa trazabilidad.<br>
    • Un puntaje intermedio refleja gestión en desarrollo, con oportunidades de estandarización.<br>
    • Un puntaje alto muestra un sistema de control maduro, con espacio para innovaciones.
  </p>
`;

  analisisWrapper.appendChild(secPuntaje);

  // ===========================================================
  // RECOMENDACIONES POR NIVEL (debe ir ANTES de usar recs)
  // ===========================================================
  const recomendacionesPorNivel = {
    Avanzado: [
      "Mantener auditorías periódicas y métricas avanzadas por categoría ambiental.",
      "Explorar proyectos de innovación en economía circular y eficiencia energética.",
      "Evaluar certificaciones ambientales (por ejemplo, ISO 14001) como siguiente paso.",
    ],
    Intermedio: [
      "Formalizar metas anuales de reducción para carbono, agua y residuos.",
      "Reforzar la trazabilidad de datos mediante registros mensuales y responsables definidos.",
      "Implementar mejoras en eficiencia energética e hídrica con indicadores de seguimiento.",
    ],
    Básico: [
      "Completar un diagnóstico más detallado de línea base para las principales fuentes de impacto.",
      "Establecer registros sistemáticos de consumos y generación de residuos.",
      "Capacitar a equipos clave en buenas prácticas ambientales y cumplimiento normativo.",
    ],
    Bajo: [
      "Identificar brechas críticas de cumplimiento y riesgos operacionales asociados al medio ambiente.",
      "Elaborar un plan inicial de registro y gestión para carbono, agua y residuos.",
      "Aplicar medidas simples de eficiencia de bajo costo como primer paso estructurado.",
    ],
  };

  const recs = recomendacionesPorNivel[evaluacion.nivel] || [];

  // ---------------- Recuadro ----------------
  const recsBlock = document.createElement("div");
  recsBlock.style.marginTop = "4px";

  recsBlock.innerHTML = `
  <h3 style="font-size:13px; font-weight:bold; margin-bottom:4px;">
    Recomendaciones según el nivel obtenido
  </h3>
  <ul style="font-size:10px; padding-left:18px; margin:0; line-height:1.4;">
    ${recs.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join("")}
  </ul>
`;

  analisisWrapper.appendChild(recsBlock);

  // ===========================================================
  // 6.2 HUELLA DE CARBONO (Impacto Real)
  // ===========================================================
  const secCarbono = document.createElement("div");
  secCarbono.style.marginTop = "16px";

  const esA1Mayor = a1Ton > a2Ton;
  const esA2Mayor = a2Ton > a1Ton;

  let analisisCarbono = "";

  if (esA1Mayor) {
    analisisCarbono = `
    Las emisiones directas por combustibles (A1) representan la mayor proporción
    de la huella total. Esto puede deberse al uso intensivo de calderas, flota,
    maquinaria o procesos térmicos. Se recomienda evaluar eficiencia operativa,
    mantenimiento y alternativas energéticas.
  `;
  } else if (esA2Mayor) {
    analisisCarbono = `
    La mayor parte de las emisiones proviene del consumo eléctrico (A2). 
    Esto sugiere una dependencia importante de sistemas eléctricos,
    recomendándose eficiencia, recambio tecnológico y energías renovables.
  `;
  } else {
    analisisCarbono = `
    Las emisiones están equilibradas entre A1 y A2, indicando que ambas fuentes
    contribuyen proporcionalmente. Esto permite aplicar medidas de reducción
    simultáneas.
  `;
  }

  secCarbono.innerHTML = `
  <h2 style="font-size:14px; font-weight:bold; margin-bottom:6px;">
    2. Huella de Carbono (Impacto Real)
  </h2>

  <p style="font-size:10px; margin:0 0 6px 0; line-height:1.45; color:#444;">
    La huella de carbono total para el período evaluado corresponde a 
    <strong>${totalTon.toFixed(2)} tCO₂e</strong>, compuesta por 
    <strong>${a1Ton.toFixed(2)} t</strong> de emisiones directas (A1) 
    y <strong>${a2Ton.toFixed(2)} t</strong> de electricidad (A2).
  </p>

  <p style="font-size:10px; margin:0 0 6px 0; color:#444;">
    ${analisisCarbono}
  </p>
`;

  analisisWrapper.appendChild(secCarbono);

  // ===========================================================
  // 6.3 LEY REP (Cumplimiento Normativo)
  // ===========================================================
  const secRep = document.createElement("div");
  secRep.style.marginTop = "16px";

  let textoRep = "";

  if (repRegistros.length > 0) {
    textoRep = `
    El gráfico compara los residuos totales declarados con los productos prioritarios
    reportados al sistema REP en el último año disponible. Esto permite identificar
    brechas de valorización o posibles sub-declaraciones.
    <br><br>
    La Ley REP establece <strong>metas obligatorias y progresivas</strong> de recolección 
    y valorización para envases, neumáticos, electrónicos y otros productos. 
    Cuando los valores reportados están por debajo de estas metas, la empresa debe 
    fortalecer la segregación en origen, la trazabilidad y la relación con gestores 
    autorizados.
  `;
  } else {
    textoRep = `
    No se encontraron registros REP asociados a esta empresa. Se recomienda verificar 
    si aplica la obligación de declarar productos prioritarios y asegurar la inscripción
    en el sistema para evitar incumplimientos.
  `;
  }

  secRep.innerHTML = `
  <h2 style="font-size:14px; font-weight:bold; margin-bottom:6px;">
    3. Gestión de Residuos – Ley REP
  </h2>

  <p style="font-size:10px; color:#444; margin:0 0 6px 0; line-height:1.45;">
    ${textoRep}
  </p>
`;

  analisisWrapper.appendChild(secRep);

  // Agregar wrapper completo a la página 2
  page2.appendChild(analisisWrapper);

  // FOOTER PÁGINA 2
  const footer2 = document.createElement("p");
  footer2.style.marginTop = "18px";
  footer2.style.textAlign = "center";
  footer2.style.fontSize = "9px";
  footer2.style.color = "#6B7280";
  footer2.textContent =
    "Página 2 de 2 — Diagnóstico generado con AmbientAPP — mellamowalter.cl (2025)";
  page2.appendChild(footer2);






  // -----------------------------------------------------------
  // 4. CAPTURAR CADA PÁGINA A PDF (FORMATO CARTA)
  // -----------------------------------------------------------
  try {
    const canvasPage1 = await html2canvas(page1, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "white",
    });

    const canvasPage2 = await html2canvas(page2, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "white",
    });

    const pdf = new jsPDF("p", "pt", "letter");

    const pageWidth = pdf.internal.pageSize.getWidth();

    // ---- Página 1 ----
    const img1 = canvasPage1.toDataURL("image/png");
    const imgHeight1 = (canvasPage1.height * pageWidth) / canvasPage1.width;
    pdf.addImage(img1, "PNG", 0, 0, pageWidth, imgHeight1);

    // ---- Página 2 ----
    const img2 = canvasPage2.toDataURL("image/png");
    const imgHeight2 = (canvasPage2.height * pageWidth) / canvasPage2.width;
    pdf.addPage();
    pdf.addImage(img2, "PNG", 0, 0, pageWidth, imgHeight2);

    pdf.save(`diagnostico_${evaluacion._id || "ambiental"}.pdf`);
  } catch (error) {
    console.error("Error al generar PDF:", error);
  } finally {
    root.remove();
  }
}