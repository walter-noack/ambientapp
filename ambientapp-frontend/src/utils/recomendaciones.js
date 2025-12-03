// ============================================================
// 📋 SISTEMA DE RECOMENDACIONES PERSONALIZADAS
// ============================================================

/**
 * Genera recomendaciones priorizadas por impacto y facilidad
 * @param {Object} evaluacion - Objeto completo de evaluación
 * @returns {Array} Array de recomendaciones con prioridad, impacto y facilidad
 */
export const generarRecomendacionesPriorizadas = (evaluacion) => {
  const recomendaciones = [];
  const { scores, emisiones, waterData, wasteData, intensidadHidrica } = evaluacion;

  // ============================================================
  // CARBONO - Recomendaciones
  // ============================================================
  if (scores?.carbonScore < 40) {
    recomendaciones.push({
      dimension: "Huella de Carbono",
      titulo: "Transición a energías renovables",
      descripcion: "Instalar paneles solares o contratar suministro de energía 100% renovable",
      impacto: "Alto",
      facilidad: "Media",
      prioridad: 1,
      ahorroPotencial: "Reducción de 30-50% en emisiones de Alcance 2",
      plazo: "6-12 meses",
      icono: "⚡"
    });
    
    recomendaciones.push({
      dimension: "Huella de Carbono",
      titulo: "Optimización de iluminación",
      descripcion: "Reemplazar toda la iluminación por tecnología LED de alta eficiencia",
      impacto: "Medio",
      facilidad: "Alta",
      prioridad: 2,
      ahorroPotencial: "Reducción de 15-25% en consumo eléctrico",
      plazo: "1-3 meses",
      icono: "💡"
    });
    
    recomendaciones.push({
      dimension: "Huella de Carbono",
      titulo: "Auditoría energética profesional",
      descripcion: "Contratar auditoría para identificar puntos críticos de consumo",
      impacto: "Alto",
      facilidad: "Alta",
      prioridad: 2,
      ahorroPotencial: "Identificación de 20-40% de oportunidades de ahorro",
      plazo: "1-2 meses",
      icono: "🔍"
    });
  } else if (scores?.carbonScore < 70) {
    recomendaciones.push({
      dimension: "Huella de Carbono",
      titulo: "Monitoreo continuo de consumo",
      descripcion: "Implementar sistema de medición en tiempo real del consumo energético",
      impacto: "Medio",
      facilidad: "Media",
      prioridad: 3,
      ahorroPotencial: "Reducción de 5-15% por mejor gestión",
      plazo: "2-4 meses",
      icono: "📊"
    });
  } else {
    recomendaciones.push({
      dimension: "Huella de Carbono",
      titulo: "Certificación de carbono neutralidad",
      descripcion: "Evaluar certificación ISO 14064 o carbono neutral",
      impacto: "Medio",
      facilidad: "Media",
      prioridad: 4,
      ahorroPotencial: "Mejora de imagen corporativa y acceso a mercados",
      plazo: "6-12 meses",
      icono: "🏆"
    });
  }

  // ============================================================
  // AGUA - Recomendaciones
  // ============================================================
  if (scores?.waterScore < 40) {
    recomendaciones.push({
      dimension: "Gestión Hídrica",
      titulo: "Detección y reparación de fugas",
      descripcion: "Realizar auditoría de fugas y reparar todas las pérdidas identificadas",
      impacto: "Alto",
      facilidad: "Alta",
      prioridad: 1,
      ahorroPotencial: "Reducción de 15-30% en consumo",
      plazo: "1 mes",
      icono: "🔧"
    });
    
    recomendaciones.push({
      dimension: "Gestión Hídrica",
      titulo: "Sistema de recirculación de agua",
      descripcion: "Implementar sistema de tratamiento y reutilización de aguas grises",
      impacto: "Alto",
      facilidad: "Baja",
      prioridad: 2,
      ahorroPotencial: "Reducción de 40-60% en consumo de agua potable",
      plazo: "6-12 meses",
      icono: "♻️"
    });
  } else if (scores?.waterScore < 70) {
    recomendaciones.push({
      dimension: "Gestión Hídrica",
      titulo: "Medición y monitoreo continuo",
      descripcion: "Instalar medidores inteligentes para seguimiento en tiempo real",
      impacto: "Medio",
      facilidad: "Media",
      prioridad: 3,
      ahorroPotencial: "Reducción de 10-20% por mejor gestión",
      plazo: "2-4 meses",
      icono: "📊"
    });
    
    recomendaciones.push({
      dimension: "Gestión Hídrica",
      titulo: "Tecnologías de ahorro de agua",
      descripcion: "Instalar grifería eficiente, inodoros de bajo consumo y sistemas de riego tecnificado",
      impacto: "Medio",
      facilidad: "Alta",
      prioridad: 3,
      ahorroPotencial: "Reducción de 15-25% en consumo",
      plazo: "2-3 meses",
      icono: "💧"
    });
  } else {
    recomendaciones.push({
      dimension: "Gestión Hídrica",
      titulo: "Captación de aguas lluvias",
      descripcion: "Evaluar sistema de captación y almacenamiento de aguas lluvias",
      impacto: "Medio",
      facilidad: "Media",
      prioridad: 4,
      ahorroPotencial: "Reducción de 10-20% en consumo de agua potable",
      plazo: "4-8 meses",
      icono: "🌧️"
    });
  }

  // ============================================================
  // RESIDUOS - Recomendaciones
  // ============================================================
  if (scores?.wasteScore < 40) {
    recomendaciones.push({
      dimension: "Gestión de Residuos",
      titulo: "Programa de separación en origen",
      descripcion: "Implementar sistema de contenedores diferenciados según Ley REP",
      impacto: "Alto",
      facilidad: "Alta",
      prioridad: 1,
      ahorroPotencial: "Aumentar reciclaje de 10% a 50%+",
      plazo: "1-2 meses",
      icono: "🗑️"
    });
    
    recomendaciones.push({
      dimension: "Gestión de Residuos",
      titulo: "Capacitación del personal",
      descripcion: "Programa de formación en gestión de residuos y economía circular",
      impacto: "Alto",
      facilidad: "Alta",
      prioridad: 1,
      ahorroPotencial: "Mejora de 30-50% en segregación correcta",
      plazo: "1 mes",
      icono: "👥"
    });
  } else if (scores?.wasteScore < 70) {
    recomendaciones.push({
      dimension: "Gestión de Residuos",
      titulo: "Optimización de reciclaje",
      descripcion: "Mejorar clasificación y aumentar categorías de materiales reciclados",
      impacto: "Medio",
      facilidad: "Alta",
      prioridad: 3,
      ahorroPotencial: "Aumentar reciclaje en 15-25%",
      plazo: "2-3 meses",
      icono: "📈"
    });
    
    recomendaciones.push({
      dimension: "Gestión de Residuos",
      titulo: "Alianzas con gestores certificados",
      descripcion: "Establecer convenios con gestores autorizados para valorización",
      impacto: "Medio",
      facilidad: "Media",
      prioridad: 3,
      ahorroPotencial: "Aumentar valorización en 20-30%",
      plazo: "2-4 meses",
      icono: "🤝"
    });
  } else {
    recomendaciones.push({
      dimension: "Gestión de Residuos",
      titulo: "Economía circular",
      descripcion: "Evaluar oportunidades de simbiosis industrial y valorización avanzada",
      impacto: "Alto",
      facilidad: "Baja",
      prioridad: 4,
      ahorroPotencial: "Reducción de 30-50% en residuos a disposición final",
      plazo: "6-12 meses",
      icono: "🔄"
    });
  }

  // Ordenar por prioridad
  return recomendaciones.sort((a, b) => a.prioridad - b.prioridad);
};

// Función legacy para compatibilidad
export const generarRecomendaciones = (scores, finalScore) => {
  const recomendacionesPriorizadas = generarRecomendacionesPriorizadas({
    scores,
    finalScore,
    emisiones: {},
    waterData: {},
    wasteData: {},
    intensidadHidrica: null
  });

  return recomendacionesPriorizadas.map(r => r.descripcion);
};