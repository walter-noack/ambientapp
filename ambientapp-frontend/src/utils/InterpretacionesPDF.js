// src/utils/interpretacionesPDF.js

// -----------------------------------------------------------------------------
// 🧊 INTERPRETAR RADAR
// -----------------------------------------------------------------------------
export function interpretarRadar(scores) {
  if (!scores) {
    return "Aún no se han calculado los puntajes ambientales para esta evaluación.";
  }

  const carbon = scores.carbonScore ?? 0;
  const agua = scores.waterScore ?? 0;
  const residuos = scores.wasteScore ?? 0;

  const dimensiones = [
    { label: "Huella de carbono", valor: carbon },
    { label: "Gestión hídrica", valor: agua },
    { label: "Gestión de residuos", valor: residuos }
  ];

  const ordenadas = [...dimensiones].sort((a, b) => b.valor - a.valor);
  const mejor = ordenadas[0];
  const peor = ordenadas[ordenadas.length - 1];

  return `El perfil ambiental muestra un mejor desempeño en ${mejor.label.toLowerCase()} (${mejor.valor} pts), mientras que la principal oportunidad de mejora se encuentra en ${peor.label.toLowerCase()} (${peor.valor} pts).`;
}

// -----------------------------------------------------------------------------
// 🧊 INTERPRETAR CARBONO
// -----------------------------------------------------------------------------
export function interpretarCarbono(emisiones) {
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
      "La mayor contribución proviene de combustibles (Alcance 1). Se recomienda revisar eficiencia térmica y flota.";
  } else if (p2 > p1 + 10) {
    foco =
      "La mayor contribución proviene del consumo eléctrico (Alcance 2). Se recomienda eficiencia energética y energías renovables.";
  } else {
    foco =
      "Las emisiones están equilibradas entre combustibles y electricidad, lo que permite acciones combinadas.";
  }

  return `La huella total es de ${totalTon.toFixed(
    2
  )} tCO₂e. ${p1.toFixed(
    1
  )}% corresponde a combustibles (Alcance 1) y ${p2.toFixed(
    1
  )}% a electricidad (Alcance 2). ${foco}`;
}

// -----------------------------------------------------------------------------
// 🧊 INTERPRETAR LEY REP
// -----------------------------------------------------------------------------
export function interpretarRep(residuosRep, evaluacion) {
  if (!residuosRep || residuosRep.length === 0) {
    return "Aún no existen registros REP asociados. Se recomienda establecer una línea base de generación y valorización.";
  }

  const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
  const ultimo = años[años.length - 1];

  const registros = residuosRep.filter((r) => r.anio === ultimo);

  const promedio =
    registros.reduce((sum, r) => sum + (r.porcentajeValorizacion || 0), 0) /
    (registros.length || 1);

  let lectura = "";
  if (promedio >= 55) lectura = "La valorización es alta y muestra madurez.";
  else if (promedio >= 30) lectura = "La valorización es intermedia, con margen de mejora.";
  else lectura = "La valorización es baja; se recomienda revisar segregación y gestores.";

  const totalResiduos = evaluacion?.wasteData?.residuosTotales || 0;

  return `Para el año ${ultimo}, el porcentaje promedio de valorización es ${promedio.toFixed(
    1
  )}%. Considerando ${totalResiduos.toLocaleString(
    "es-CL"
  )} kg de residuos, la gestión REP requiere seguimiento anual y consistencia con el sistema de gestión. ${lectura}`;
}

// -----------------------------------------------------------------------------
// 🧊 ANÁLISIS GLOBAL
// -----------------------------------------------------------------------------
export function analisisGlobal(evaluacion, emisiones, residuosRep) {
  if (!evaluacion || !evaluacion.scores) {
    return "No se cuenta con información suficiente para un análisis global.";
  }

  const { finalScore, nivel, scores } = evaluacion;
  const { carbonScore, waterScore, wasteScore } = scores;

  const fortalezas = [];
  const oportunidades = [];

  if (waterScore >= 60) fortalezas.push("Gestión del agua");
  else oportunidades.push("Consumo hídrico");

  if (wasteScore >= 60) fortalezas.push("Gestión de residuos");
  else oportunidades.push("Valorización de residuos");

  if (carbonScore >= 60) fortalezas.push("Huella de carbono");
  else oportunidades.push("Eficiencia energética");

  const tFort = fortalezas.length
    ? `Fortalezas: ${fortalezas.join(", ")}.`
    : "No se identifican fortalezas destacadas.";

  const tOpp =
    oportunidades.length > 0
      ? `Oportunidades: ${oportunidades.join(", ")}.`
      : "Desempeño robusto en todas las dimensiones.";

  const tieneRep = residuosRep?.length > 0;
  const repTxt = tieneRep
    ? "Se recomienda mantener seguimiento anual a metas de valorización REP."
    : "Se recomienda levantar registros de productos prioritarios REP.";

  return `El puntaje global es ${finalScore.toFixed(
    1
  )}/100 (nivel ${nivel}). ${tFort} ${tOpp} ${repTxt}`;
}