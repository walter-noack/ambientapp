export const generarRecomendaciones = (scores, finalScore) => {
  const { carbonScore, waterScore, wasteScore } = scores;
  const recomendaciones = [];
  
  // Recomendaciones de carbono
  if (carbonScore < 40) {
    recomendaciones.push('Optimizar el consumo de electricidad mediante iluminación LED y equipos eficientes.');
    recomendaciones.push('Considerar fuentes de energía renovable como paneles solares.');
  } else if (carbonScore < 70) {
    recomendaciones.push('Continuar monitoreando el consumo energético y buscar oportunidades de mejora.');
  }
  
  // Recomendaciones de agua
  if (waterScore < 40) {
    recomendaciones.push('Implementar sistemas de recirculación y reutilización de agua.');
    recomendaciones.push('Instalar dispositivos ahorradores de agua en todas las instalaciones.');
  } else if (waterScore < 70) {
    recomendaciones.push('Mantener el monitoreo del consumo de agua y reparar fugas rápidamente.');
  }
  
  // Recomendaciones de residuos
  if (wasteScore < 40) {
    recomendaciones.push('Implementar un programa de separación de residuos según la Ley REP (Responsabilidad Extendida del Productor).');
    recomendaciones.push('Capacitar al personal en gestión de residuos y reciclaje.');
  } else if (wasteScore < 70) {
    recomendaciones.push('Aumentar el porcentaje de reciclaje mediante mejor clasificación de residuos.');
  }
  
  // Recomendación general
  if (finalScore >= 71) {
    recomendaciones.push('La empresa muestra un buen nivel de desempeño ambiental. Mantener y documentar los procesos actuales.');
  } else if (finalScore < 36) {
    recomendaciones.push('Se requiere acción urgente en múltiples áreas ambientales. Considerar auditoría externa.');
  }
  
  if (recomendaciones.length === 0) {
    recomendaciones.push('Continuar con las prácticas actuales y mantener el monitoreo regular.');
  }
  
  return recomendaciones;
};