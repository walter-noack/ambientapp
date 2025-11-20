// utils/calculosHuella.js
//----------------------------------------------------------
// FACTORES DE EMISIÓN CHILE 2023 (tCO2e por unidad)
//----------------------------------------------------------
const FE_ELECTRICIDAD = 0.000367;  // kWh → Alcance 2
const FE_GAS = 0.00296;            // kg → Alcance 1
const FE_DIESEL = 0.00268;         // litro → Alcance 1
const FE_BENCINA = 0.00230;        // litro → Alcance 1

//----------------------------------------------------------
// 1. CÁLCULO DE EMISIONES ALCANCES 1 Y 2
//----------------------------------------------------------
export const calcularEmisionesCarbono = (carbonData) => {
  const {
    electricidad = 0,
    gas = 0,
    diesel = 0,
    bencina = 0,
  } = carbonData;

  // Alcance 1
  const eGas = gas * FE_GAS;
  const eDiesel = diesel * FE_DIESEL;
  const eBencina = bencina * FE_BENCINA;

  const alcance1 = eGas + eDiesel + eBencina;

  // Alcance 2
  const alcance2 = electricidad * FE_ELECTRICIDAD;

  const total = alcance1 + alcance2;

  // Scoring simple
  let carbonScore = 100;
  if (total > 20) carbonScore = 20;
  else if (total > 10) carbonScore = 50;
  else if (total > 5) carbonScore = 70;
  else carbonScore = 90;

  return {
    emisiones: {
      alcance1: Number(alcance1.toFixed(3)),
      alcance2: Number(alcance2.toFixed(3)),
      total: Number(total.toFixed(3)),
      detalle: {
        gas: Number(eGas.toFixed(3)),
        diesel: Number(eDiesel.toFixed(3)),
        bencina: Number(eBencina.toFixed(3)),
        electricidad: Number(alcance2.toFixed(3)),
      },
    },
    carbonScore,
  };
};

//----------------------------------------------------------
// 2. AGUA
//----------------------------------------------------------
export const calcularScoreAgua = (waterData) => {
  const { consumoMensual = 0 } = waterData;

  let waterScore = 90;

  if (consumoMensual > 30000) waterScore = 20;
  else if (consumoMensual >= 10000) waterScore = 60;

  return waterScore;
};

//----------------------------------------------------------
// 3. RESIDUOS
//----------------------------------------------------------
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
    porcentajeReciclaje: Number(porcentajeReciclaje.toFixed(2)),
    wasteScore,
  };
};

//----------------------------------------------------------
// 4. SCORE FINAL
//----------------------------------------------------------
export const calcularScoreFinal = (scores) => {
  const { carbonScore, waterScore, wasteScore } = scores;

  const finalScore =
    carbonScore * 0.4 + waterScore * 0.3 + wasteScore * 0.3;

  let nivel = "Bajo";
  if (finalScore >= 80) nivel = "Avanzado";
  else if (finalScore >= 60) nivel = "Intermedio";
  else if (finalScore >= 30) nivel = "Básico";

  return {
    finalScore: Number(finalScore.toFixed(2)),
    nivel,
  };
};

//----------------------------------------------------------
// 5. FUNCIÓN PRINCIPAL
//----------------------------------------------------------
export const calcularEvaluacionReal = (formData) => {
  const { carbonData, waterData, wasteData } = formData;

  const { emisiones, carbonScore } = calcularEmisionesCarbono(carbonData);
  const waterScore = calcularScoreAgua(waterData);
  const { porcentajeReciclaje, wasteScore } = calcularScoreResiduos(wasteData);

  const scores = { carbonScore, waterScore, wasteScore };

  const { finalScore, nivel } = calcularScoreFinal(scores);

  return {
    carbonData: { ...carbonData, emisiones },
    waterData,
    wasteData: { ...wasteData, porcentajeReciclaje },
    scores,
    finalScore,
    nivel,
  };
};