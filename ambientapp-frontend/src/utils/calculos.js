// utils/calculos.js

// ============================================================
// 🔥 1. Cálculo de Emisiones de Carbono (incluye BENCINA)
// ============================================================
export const calcularEmisionesCarbono = (carbonData) => {
  const {
    electricidad = 0,
    gas = 0,
    diesel = 0,
    bencina = 0,
  } = carbonData;

  // Factores de emisión (ton CO2e)
  const FE_ELECTRICIDAD = 0.00045;
  const FE_GAS = 0.00298;
  const FE_DIESEL = 0.00270;
  const FE_BENCINA = 0.00231;

  const emisionElectricidad = electricidad * FE_ELECTRICIDAD;
  const emisionGas = gas * FE_GAS;
  const emisionDiesel = diesel * FE_DIESEL;
  const emisionBencina = bencina * FE_BENCINA;

  const totalEmisiones =
    emisionElectricidad + emisionGas + emisionDiesel + emisionBencina;

  // Score basado en rangos simples
  let carbonScore = 100;
  if (totalEmisiones > 20) carbonScore = 20;
  else if (totalEmisiones > 10) carbonScore = 50;
  else if (totalEmisiones > 5) carbonScore = 70;
  else carbonScore = 90;

  return {
    totalEmisiones: parseFloat(totalEmisiones.toFixed(3)),
    carbonScore,
  };
};

// ============================================================
// 🔵 2. Agua
// ============================================================
export const calcularScoreAgua = (waterData) => {
  const { consumoMensual = 0 } = waterData;

  let waterScore = 90;

  if (consumoMensual > 30000) waterScore = 20;
  else if (consumoMensual >= 10000) waterScore = 60;

  return waterScore;
};

// ============================================================
// 🟢 3. Residuos
// ============================================================
export const calcularScoreResiduos = (wasteData) => {
  const { residuosTotales = 0, residuosReciclados = 0 } = wasteData;

  let porcentajeReciclaje = 0;
  let wasteScore = 30;

  if (residuosTotales > 0) {
    porcentajeReciclaje = (residuosReciclados / residuosTotales) * 100;

    if (porcentajeReciclaje > 50) wasteScore = 90;
    else if (porcentajeReciclaje >= 20) wasteScore = 60;
  }

  return {
    porcentajeReciclaje: parseFloat(porcentajeReciclaje.toFixed(2)),
    wasteScore,
  };
};

// ============================================================
// 🌎 4. Score Final (escala de 4 niveles)
// ============================================================
export const calcularScoreFinal = (scores) => {
  const { carbonScore, waterScore, wasteScore } = scores;

  // Peso: 40% carbono, 30% agua, 30% residuos
  const finalScore =
    carbonScore * 0.4 + waterScore * 0.3 + wasteScore * 0.3;

  let nivel = "Bajo";

  if (finalScore >= 80) nivel = "Avanzado";
  else if (finalScore >= 60) nivel = "Intermedio";
  else if (finalScore >= 30) nivel = "Básico";
  else nivel = "Bajo";

  return {
    finalScore: parseFloat(finalScore.toFixed(2)),
    nivel,
  };
};

// ============================================================
// 🔧 5. Función principal
// ============================================================
export const calcularEvaluacion = (formData) => {
  const { carbonData, waterData, wasteData } = formData;

  const { totalEmisiones, carbonScore } = calcularEmisionesCarbono(carbonData);
  const waterScore = calcularScoreAgua(waterData);
  const { porcentajeReciclaje, wasteScore } = calcularScoreResiduos(wasteData);

  const scores = { carbonScore, waterScore, wasteScore };

  const { finalScore, nivel } = calcularScoreFinal(scores);

  return {
    carbonData: { ...carbonData, totalEmisiones },
    waterData,
    wasteData: { ...wasteData, porcentajeReciclaje },
    scores,
    finalScore,
    nivel,
  };
};