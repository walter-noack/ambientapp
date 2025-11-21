// =============================================
// 🔥 CÁLCULOS HUELLA DE CARBONO – CHILE 2023
// Basado en FE oficiales (Ministerio del Medio Ambiente)
// =============================================

// ---------------------------------------------
// 1) FACTORES DE EMISIÓN CHILE 2023 (kg CO2e/u)
// ---------------------------------------------
// Fuente: Inventario GEI Chile + Guías GHG Chile

// Alcance 1 – Combustibles
const FE_DIESEL = 2.68;      // kg CO2e por litro
const FE_BENCINA = 2.32;     // kg CO2e por litro
const FE_GAS_NATURAL = 2.00; // kg CO2e por kg  (promedio industrial)

// Alcance 2 – Electricidad
const FE_ELECTRICIDAD = 0.300; // kg CO2e por kWh (factor 2023 SIC-SING consolidado)


// ===========================================================
// 🔥 1. Cálculo de Emisiones de Carbono con Alcances
// ===========================================================
export function calcularEmisionesCarbono(carbonData) {
  const {
    electricidad = 0,
    gas = 0,
    diesel = 0,
    bencina = 0,
  } = carbonData;

  // Alcance 1
  const emisionDiesel = diesel * FE_DIESEL;
  const emisionBencina = bencina * FE_BENCINA;
  const emisionGasNatural = gas * FE_GAS_NATURAL;

  const alcance1 =
    emisionDiesel + emisionBencina + emisionGasNatural;

  // Alcance 2
  const alcance2 = electricidad * FE_ELECTRICIDAD;

  // Total (kg → ton)
  const totalKg = alcance1 + alcance2;
  const totalTon = totalKg / 1000;

  // Score ambiental (escala simple por ahora)
  let carbonScore = 90;
  if (totalTon > 50) carbonScore = 20;
  else if (totalTon > 20) carbonScore = 40;
  else if (totalTon > 10) carbonScore = 60;

  return {
    // Valores base
    alcance1: parseFloat(alcance1.toFixed(3)),
    alcance2: parseFloat(alcance2.toFixed(3)),
    totalKg: parseFloat(totalKg.toFixed(3)),
    totalTon: parseFloat(totalTon.toFixed(3)),

    // Desglose interno
    detalle: {
      diesel: parseFloat(emisionDiesel.toFixed(3)),
      bencina: parseFloat(emisionBencina.toFixed(3)),
      gasNatural: parseFloat(emisionGasNatural.toFixed(3)),
      electricidad: parseFloat(alcance2.toFixed(3)),
    },

    carbonScore,
  };
}



// ============================================================
// 🔵 2. Score Agua
// ============================================================
export function calcularScoreAgua(waterData) {
  const { consumoMensual = 0 } = waterData;

  let waterScore = 90;
  if (consumoMensual > 30000) waterScore = 20;
  else if (consumoMensual >= 10000) waterScore = 60;

  return waterScore;
}



// ============================================================
// 🟢 3. Score Residuos
// ============================================================
export function calcularScoreResiduos(wasteData) {
  const { residuosTotales = 0, residuosReciclados = 0 } = wasteData;

  let porcentajeReciclaje = 0;
  let wasteScore = 30;

  if (residuosTotales > 0) {
    porcentajeReciclaje =
      (residuosReciclados / residuosTotales) * 100;

    if (porcentajeReciclaje > 50) wasteScore = 90;
    else if (porcentajeReciclaje >= 20) wasteScore = 60;
  }

  return {
    porcentajeReciclaje: parseFloat(porcentajeReciclaje.toFixed(2)),
    wasteScore,
  };
}



// ============================================================
// 🌎 4. Score Final
// ============================================================
export function calcularScoreFinal(scores) {
  const { carbonScore, waterScore, wasteScore } = scores;

  const finalScore =
    0.4 * carbonScore +
    0.3 * waterScore +
    0.3 * wasteScore;

  let nivel = "Bajo";
  if (finalScore >= 80) nivel = "Avanzado";
  else if (finalScore >= 60) nivel = "Intermedio";
  else if (finalScore >= 30) nivel = "Básico";

  return {
    finalScore: parseFloat(finalScore.toFixed(1)),
    nivel,
  };
}



// ============================================================
// 🔧 5. Función principal ARMADA para tu app
// ============================================================
export function calcularEvaluacionReal(formData) {
  const {
    carbonData,
    waterData,
    wasteData
  } = formData;

  const carbono = calcularEmisionesCarbono(carbonData);
  const waterScore = calcularScoreAgua(waterData);
  const residuos = calcularScoreResiduos(wasteData);

  const scores = {
    carbonScore: carbono.carbonScore,
    waterScore,
    wasteScore: residuos.wasteScore,
  };

  const nivelFinal = calcularScoreFinal(scores);

  return {
    emisiones: {
      ...carbono,
    },

    scores,
    finalScore: nivelFinal.finalScore,
    nivel: nivelFinal.nivel,
  };
}