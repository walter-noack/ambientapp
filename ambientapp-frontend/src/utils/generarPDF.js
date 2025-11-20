import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Chart from "chart.js/auto";

export default async function generarPDF(evaluacion) {
  if (!evaluacion) {
    console.error("No se recibió evaluación en generarPDF.");
    return;
  }

  // -----------------------------------------------------------
  // 1. LIMPIAR CUALQUIER INFORME ANTERIOR
  // -----------------------------------------------------------
  const old = document.getElementById("informe-pdf");
  if (old) old.remove();

  // -----------------------------------------------------------
  // 2. COLORES Y DATOS BÁSICOS
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

  // -----------------------------------------------------------
  // 3. HUELLA REAL (valores y versión logarítmica)
  // -----------------------------------------------------------
  const carbonoTon = Number(
    evaluacion?.resultadosHuella?.carbono?.emisionesTotalesTonCO2 ??
    evaluacion?.carbonData?.totalEmisiones ??
    0
  );
  const aguaLitros = Number(
    evaluacion?.resultadosHuella?.agua?.consumoLitros ??
    evaluacion?.waterData?.consumoMensual ??
    0
  );
  const residuosKg = Number(
    evaluacion?.resultadosHuella?.residuos?.residuosTotalesKg ??
    evaluacion?.wasteData?.residuosTotales ??
    0
  );

  const log10 = (x) => (x > 0 ? Math.log10(x + 1) : 0);

  const nCarbono = log10(carbonoTon);
  const nAgua = log10(aguaLitros);
  const nResiduos = log10(residuosKg);

  const formatNumber = (num) => {
    if (!num || Number.isNaN(num) || num === 0) return "—";
    try {
      return num.toLocaleString("es-CL");
    } catch {
      return String(num);
    }
  };

  // -----------------------------------------------------------
  // 4. CREAR GRÁFICOS PRIMERO (antes del contenedor PDF)
  // -----------------------------------------------------------

  // Crear contenedores temporales VISIBLES pero fuera de vista
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.top = "0";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = "400px";
  tempContainer.style.height = "400px";
  tempContainer.style.background = "white";
  document.body.appendChild(tempContainer);

  // Canvas 1: Distribución de Puntaje (más pequeño)
  const canvas1Container = document.createElement("div");
  canvas1Container.style.width = "220px";
  canvas1Container.style.height = "220px";
  canvas1Container.style.position = "relative";
  tempContainer.appendChild(canvas1Container);

  const canvas1 = document.createElement("canvas");
  canvas1.width = 220;
  canvas1.height = 220;
  canvas1Container.appendChild(canvas1);

  const chart1 = new Chart(canvas1, {
    type: "doughnut",
    data: {
      labels: ["Carbono", "Agua", "Residuos"],
      datasets: [{
        data: [carbonScore, waterScore, wasteScore],
        backgroundColor: ["#DC2626", "#2563EB", "#059669"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 8,
            font: { size: 10 },
            usePointStyle: true,
            boxWidth: 8
          }
        }
      }
    }
  });

  // Canvas 2: Distribución Normalizada (más pequeño)
  const canvas2Container = document.createElement("div");
  canvas2Container.style.width = "220px";
  canvas2Container.style.height = "220px";
  canvas2Container.style.position = "relative";
  canvas2Container.style.marginTop = "20px";
  tempContainer.appendChild(canvas2Container);

  const canvas2 = document.createElement("canvas");
  canvas2.width = 220;
  canvas2.height = 220;
  canvas2Container.appendChild(canvas2);

  const chart2 = new Chart(canvas2, {
    type: "doughnut",
    data: {
      labels: ["Carbono", "Agua", "Residuos"],
      datasets: [{
        data: [nCarbono, nAgua, nResiduos],
        backgroundColor: ["#DC2626", "#2563EB", "#16A34A"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 8,
            font: { size: 10 },
            usePointStyle: true,
            boxWidth: 8
          }
        }
      }
    }
  });

  // Esperar a que los gráficos se rendericen completamente
  await new Promise(resolve => setTimeout(resolve, 500));

  // Capturar los gráficos como imágenes
  const imgScore = await html2canvas(canvas1Container, {
    scale: 2,
    backgroundColor: "white",
    logging: false
  }).then(canvas => canvas.toDataURL("image/png"));

  const imgHuella = await html2canvas(canvas2Container, {
    scale: 2,
    backgroundColor: "white",
    logging: false
  }).then(canvas => canvas.toDataURL("image/png"));

  // Destruir gráficos y limpiar
  chart1.destroy();
  chart2.destroy();
  tempContainer.remove();

  // -----------------------------------------------------------
  // 5. CONTENEDOR PRINCIPAL OCULTO
  // -----------------------------------------------------------
  const cont = document.createElement("div");
  cont.id = "informe-pdf";
  cont.style.position = "absolute";
  cont.style.top = "-9999px";
  cont.style.left = "-9999px";
  cont.style.width = "900px";
  cont.style.background = "white";
  cont.style.padding = "32px";
  cont.style.fontFamily = "Arial, sans-serif";
  cont.style.lineHeight = "1.45";
  document.body.appendChild(cont);

  // -----------------------------------------------------------
  // 6. ENCABEZADO + SCORE BOX
  // -----------------------------------------------------------
  const header = document.createElement("div");
  header.style.position = "relative";
  header.style.marginBottom = "24px";

  header.innerHTML = `
    <h1 style="font-size:28px; margin:0; font-weight:bold;">
      ${evaluacion.companyName}
    </h1>
    <p style="color:#555; font-size:14px; margin-top:4px;">
      Periodo evaluado: <strong>${evaluacion.period}</strong>
    </p>
  `;
  cont.appendChild(header);

  const scoreBox = document.createElement("div");
  scoreBox.style.cssText = `
    position:absolute;
    right:0;
    top:0;
    border:3px solid ${colorNivel};
    border-radius:14px;
    padding:12px 18px;
    text-align:right;
    box-shadow:0 3px 8px rgba(0,0,0,0.12);
  `;
  scoreBox.innerHTML = `
    <div style="font-size:22px; font-weight:bold; color:${colorNivel};">
      ${evaluacion.finalScore} / 100
    </div>
    <div style="font-size:14px; margin-top:2px; font-weight:bold;
                color:${colorNivel}; text-transform:uppercase;">
      ${evaluacion.nivel}
    </div>
  `;
  header.appendChild(scoreBox);

  // -----------------------------------------------------------
  // 7. BARRA DE NIVEL
  // -----------------------------------------------------------
  const barraNivelWrap = document.createElement("div");
  barraNivelWrap.style.marginTop = "1px";
  barraNivelWrap.innerHTML = `
    <div style="font-weight:bold; margin-bottom:8px; font-size:16px;">
      Nivel Ambiental
    </div>
    <div style="
      width:92%;
      margin:auto;
      display:flex;
      height:30px;
      border-radius:14px;
      overflow:hidden;
      font-size:13px;
      font-weight:600;
      box-shadow:0 2px 5px rgba(0,0,0,0.12);
    ">
      <div style="flex:1; background:#7F1D1D22; color:#7F1D1D;
                  display:flex; align-items:center; justify-content:center;">
        Bajo
      </div>
      <div style="flex:1; background:#DC262622; color:#DC2626;
                  display:flex; align-items:center; justify-content:center;">
        Básico
      </div>
      <div style="flex:1; background:#F59E0B22; color:#B45309;
                  display:flex; align-items:center; justify-content:center;">
        Intermedio
      </div>
      <div style="flex:1; background:#0284C722; color:#0284C7;
                  display:flex; align-items:center; justify-content:center;">
        Avanzado
      </div>
    </div>
    <div style="position:relative; height:18px; width:92%; margin:auto;">
      <div style="
        position:absolute;
        top:-2px;
        left: calc(${evaluacion.finalScore}% - 8px);
        width:0;
        height:0;
        border-left:8px solid transparent;
        border-right:8px solid transparent;
        border-bottom:16px solid ${colorNivel};
      "></div>
    </div>
  `;
  cont.appendChild(barraNivelWrap);

  // -----------------------------------------------------------
  // 8. TARJETAS DE PUNTAJE POR CATEGORÍA
  // -----------------------------------------------------------
  const tarjetas = document.createElement("div");
  tarjetas.innerHTML = `
    <h2 style="font-size:18px; margin-top:18px; margin-bottom:10px;">
      Puntajes por categoría
    </h2>
  `;
  const tarjetasRow = document.createElement("div");
  tarjetasRow.style.display = "flex";
  tarjetasRow.style.gap = "14px";
  tarjetasRow.style.marginBottom = "12px";

  tarjetasRow.innerHTML = `
    <div style="flex:1; background:#FEE2E2; padding:18px; border-radius:12px; text-align:center;">
      <div style="font-size:12px; color:#7F1D1D;">Carbono</div>
      <div style="font-size:24px; font-weight:bold; margin-top:6px;">${carbonScore}</div>
    </div>
    <div style="flex:1; background:#DBEAFE; padding:18px; border-radius:12px; text-align:center;">
      <div style="font-size:12px; color:#1E3A8A;">Agua</div>
      <div style="font-size:24px; font-weight:bold; margin-top:6px;">${waterScore}</div>
    </div>
    <div style="flex:1; background:#D1FAE5; padding:18px; border-radius:12px; text-align:center;">
      <div style="font-size:12px; color:#064E3B;">Residuos</div>
      <div style="font-size:24px; font-weight:bold; margin-top:6px;">${wasteScore}</div>
    </div>
  `;
  tarjetas.appendChild(tarjetasRow);
  cont.appendChild(tarjetas);

  // -----------------------------------------------------------
  // 9. INSERTAR GRÁFICOS COMO IMÁGENES (más compactos)
  // -----------------------------------------------------------
  const graficosSection = document.createElement("div");
  graficosSection.style.cssText = `
    display:flex; 
    justify-content:center;
    gap:30px; 
    margin-top:4px;
    margin-bottom:16px;
  `;

  graficosSection.innerHTML = `
    <div style="flex:1; text-align:center;">
      <h3 style="font-size:14px; font-weight:bold; margin-bottom:4px;">Distribución del Puntaje</h3>
      <p style="font-size:11px; color:#555; margin-bottom:8px;">Puntaje por categoría</p>
      <img 
        src="${imgScore}" 
        style="
          width:200px;
          height:auto;
          display:block;
          margin: 0 auto;
        "
      />
    </div>

    <div style="flex:1; text-align:center;">
      <h3 style="font-size:14px; font-weight:bold; margin-bottom:4px;">Distribución Normalizada</h3>
      <p style="font-size:11px; color:#555; margin-bottom:8px;">Escala logarítmica</p>
      <img 
        src="${imgHuella}" 
        style="
          width:200px;
          height:auto;
          display:block;
          margin: 0 auto;
        "
      />
    </div>
  `;

  cont.appendChild(graficosSection);

  // -----------------------------------------------------------
// 10. LEYENDA ULTRA COMPACTA EN LÍNEA
// -----------------------------------------------------------
const leyenda = document.createElement("div");
leyenda.style.cssText = `
  margin-top: 10px;
  margin-bottom: 16px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: #F9FAFB;
  color: #374151;
  font-size: 12px;
  line-height: 1.45;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
`;

// Formatear valores
const txtCarbono = carbonoTon > 0
  ? `${carbonoTon.toLocaleString("es-CL", { minimumFractionDigits: 2 })} kgCO₂e/período`
  : "—";

const txtAgua = aguaLitros > 0
  ? `${aguaLitros.toLocaleString("es-CL")} L/período`
  : "—";

const txtResiduos = residuosKg > 0
  ? `${residuosKg.toLocaleString("es-CL", { minimumFractionDigits: 1 })} kg/período`
  : "—";

leyenda.innerHTML = `
  <div style="text-align:center; font-weight:600; margin-bottom:4px; font-size:13px;">
    Resumen de Huella Ambiental Reportada
  </div>

  <div style="
      display:flex; 
      justify-content:center; 
      gap:18px; 
      flex-wrap:wrap;
      font-size:12px;
    ">
    
    <span style="display:flex; align-items:center; gap:5px;">
      <span style="width:10px; height:10px; background:#DC2626; border-radius:2px;"></span>
      <strong>Huella de Carbono:</strong> ${txtCarbono}
    </span>

    <span style="display:flex; align-items:center; gap:5px;">
      <span style="width:10px; height:10px; background:#2563EB; border-radius:2px;"></span>
      <strong>Consumo de Agua:</strong> ${txtAgua}
    </span>

    <span style="display:flex; align-items:center; gap:5px;">
      <span style="width:10px; height:10px; background:#16A34A; border-radius:2px;"></span>
      <strong>Generación de Residuos:</strong> ${txtResiduos}
    </span>

  </div>
`;

cont.appendChild(leyenda);

  // -----------------------------------------------------------
  // 11. ANÁLISIS INTEGRADO DEL DESEMPEÑO AMBIENTAL (NUEVO)
  // -----------------------------------------------------------
  const analisis = document.createElement("div");
  analisis.style.marginTop = "18px";

  analisis.innerHTML = `
  <h2 style="font-size:16px; font-weight:bold; margin-bottom:6px;">
    Análisis Integrado del Desempeño Ambiental
  </h2>

  <p style="font-size:12px; color:#444; margin-bottom:10px; line-height:1.4;">
    El desempeño ambiental se analiza desde dos perspectivas complementarias: 
    el <strong>puntaje técnico</strong> (nivel de gestión y control) y la 
    <strong>huella ambiental real</strong> (impacto cuantificado en carbono, agua y residuos).
    La comparación entre ambas permite identificar fortalezas, brechas y oportunidades
    relevantes para la mejora continua.
  </p>

  <h3 style="font-size:13px; font-weight:bold; margin-bottom:4px;">
    1. Comparación entre Puntaje Técnico e Impacto Real
  </h3>
  <p style="font-size:11px; line-height:1.35; margin-bottom:8px;">
    • Un puntaje alto y una huella proporcionalmente baja reflejan una 
    <strong>gestión madura y efectiva</strong>.<br>
    • Un puntaje bajo con alto impacto revela una <strong>brecha crítica</strong>, indicando 
    falta de control en áreas con riesgo ambiental significativo.<br>
    • Cuando puntaje e impacto son altos, existe gestión, pero se requieren 
    <strong>mejoras tecnológicas u operacionales</strong> para reducir el impacto real.<br>
    • Si ambos valores son bajos, la categoría no es prioritaria, pero sigue existiendo 
    espacio para acciones de mejora de bajo costo.
  </p>

  <h3 style="font-size:13px; font-weight:bold; margin-bottom:4px;">
    2. Tendencias por Categoría
  </h3>

  <p style="font-size:11px; margin-bottom:4px; line-height:1.35;">
    <strong>• Huella de Carbono (CO₂e):</strong> Representa el impacto asociado a electricidad, combustibles y movilidad. De acuerdo a la 
    metodología GHG Protocol, considera Alcance 1 y Alcance 2. 
    Un puntaje bajo con un valor de huella elevado indica necesidad de <strong>gestión energética</strong>,
    eficiencia y registro detallado.
  </p>

  <p style="font-size:11px; margin-bottom:4px; line-height:1.35;">
    <strong>• Agua:</strong> Refleja el uso hídrico en operaciones y servicios. 
    Un impacto alto con bajo puntaje sugiere poca trazabilidad o escasas medidas de eficiencia hídrica.
    Un buen puntaje con consumo moderado indica prácticas de <strong>control y ahorro hídrico</strong>.
  </p>

  <p style="font-size:11px; margin-bottom:4px; line-height:1.35;">
    <strong>• Residuos:</strong> Incluye gestión interna y cumplimiento REP. 
    Si la proporción de residuos es alta y la gestión es débil, existe riesgo operativo
    y normativo. Buen puntaje con bajo impacto indica un manejo <strong>maduro y ordenado</strong>.
  </p>

  <h3 style="font-size:13px; font-weight:bold; margin-bottom:4px;">
    3. Coherencia entre Gestión e Impacto
  </h3>
  <p style="font-size:11px; line-height:1.35; margin-bottom:8px;">
    La comparación de ambos gráficos permite detectar <strong>desalineaciones clave</strong>:
    <br>• <strong>Desalineación positiva:</strong> buena gestión → impacto controlado.
    <br>• <strong>Desalineación crítica:</strong> gestión débil → impacto elevado.
    <br>• <strong>Equilibrio neutro:</strong> valores similares, gestión coherente con impacto.
  </p>

  <div style="
    background:#F3F4F6;
    padding:10px;
    border-radius:6px;
    font-size:11px;
    margin-top:6px;
    line-height:1.35;
  ">
    💡 <strong>Insight clave:</strong> Si una categoría muestra 
    <strong>bajo puntaje técnico pero alta huella real</strong>,
    representa una oportunidad inmediata de mejora con alto retorno ambiental.
  </div>
`;

  cont.appendChild(analisis);

  // -----------------------------------------------------------
  // 12. RECOMENDACIONES (más compactas)
  // -----------------------------------------------------------
  const recomendaciones = {
    Avanzado: [
      "Mantener auditorías periódicas y métricas avanzadas",
      "Profundizar en economía circular y reducción de huella",
      "Explorar certificaciones ISO 14001 o similares"
    ],
    Intermedio: [
      "Formalizar metas anuales de reducción por categoría",
      "Reforzar mediciones periódicas y trazabilidad",
      "Implementar mejoras en eficiencia energética e hídrica"
    ],
    Básico: [
      "Realizar diagnóstico detallado de línea base",
      "Establecer registros sistemáticos de consumos",
      "Capacitar al equipo en buenas prácticas ambientales"
    ],
    Bajo: [
      "Identificar brechas críticas y riesgos de cumplimiento",
      "Elaborar plan inicial de registro y mejora",
      "Aplicar medidas simples de eficiencia (bajo costo)"
    ],
  };

  const recs = recomendaciones[evaluacion.nivel] || [];

  const recsDiv = document.createElement("div");
  recsDiv.style.marginTop = "16px";
  recsDiv.innerHTML = `
    <h2 style="font-size:16px; font-weight:bold; margin-bottom:6px;">
      Recomendaciones
    </h2>
    <ul style="font-size:11px; padding-left:16px; margin:0; line-height:1.4;">
      ${recs.map((r) => `<li style="margin-bottom:3px;">${r}</li>`).join("")}
    </ul>
  `;
  cont.appendChild(recsDiv);

  // -----------------------------------------------------------
  // 13. FOOTER
  // -----------------------------------------------------------
  const footer = document.createElement("p");
  footer.style.marginTop = "20px";
  footer.style.textAlign = "center";
  footer.style.fontSize = "10px";
  footer.style.color = "#777";
  footer.textContent = "Generado con AmbientAPP — @mellamowalter.cl (2025)";
  cont.appendChild(footer);

  // -----------------------------------------------------------
  // 14. CAPTURAR A PDF
  // -----------------------------------------------------------
  try {
    const canvasFinal = await html2canvas(cont, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "white"
    });

    const img = canvasFinal.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const w = pdf.internal.pageSize.getWidth();
    const h = (canvasFinal.height * w) / canvasFinal.width;

    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`evaluacion_${evaluacion._id}.pdf`);

    console.log("PDF generado exitosamente");
  } catch (error) {
    console.error("Error al generar PDF:", error);
  } finally {
    cont.remove();
  }
}