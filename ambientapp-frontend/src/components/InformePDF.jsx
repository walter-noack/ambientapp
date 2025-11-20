import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generarInformePDF = async (evaluacion) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  
  // Función auxiliar para agregar texto
  const addText = (text, fontSize = 12, isBold = false, addSpace = 5) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - (margin * 2));
    lines.forEach(line => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += addSpace;
  };
  
  // Función para agregar línea divisoria
  const addLine = () => {
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };
  
  // ENCABEZADO DEL PDF
  pdf.setFillColor(34, 197, 94);  // Verde
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORME DE EVALUACIÓN AMBIENTAL', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('AmbientAPP', pageWidth / 2, 30, { align: 'center' });
  
  yPosition = 50;
  pdf.setTextColor(0, 0, 0);
  
  // INFORMACIÓN GENERAL
  addText('INFORMACIÓN GENERAL', 16, true, 8);
  addLine();
  
  addText(`Empresa: ${evaluacion.companyName}`, 12, true);
  addText(`Sector: ${evaluacion.sector}`);
  addText(`Período: ${evaluacion.period}`);
  addText(`Fecha de evaluación: ${new Date(evaluacion.createdAt).toLocaleDateString('es-CL')}`);
  yPosition += 10;
  
  // RESULTADOS PRINCIPALES
  addText('RESULTADOS PRINCIPALES', 16, true, 8);
  addLine();
  
  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Alto': return [34, 197, 94];
      case 'Medio': return [251, 191, 36];
      case 'Bajo': return [239, 68, 68];
      default: return [156, 163, 175];
    }
  };
  
  const [r, g, b] = getNivelColor(evaluacion.nivel);
  pdf.setFillColor(r, g, b);
  pdf.rect(margin, yPosition, 60, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Nivel: ${evaluacion.nivel}`, margin + 30, yPosition + 10, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 20;
  
  addText(`Puntuación Final: ${evaluacion.finalScore.toFixed(2)} / 100`, 14, true);
  yPosition += 5;
  
  // PUNTUACIONES POR CATEGORÍA
  addText('PUNTUACIONES POR CATEGORÍA', 16, true, 8);
  addLine();
  
  addText(`🔴 Emisiones de Carbono: ${evaluacion.scores.carbonScore} / 100`, 12, true);
  if (evaluacion.carbonData.totalEmisiones) {
    addText(`   Total de emisiones: ${evaluacion.carbonData.totalEmisiones} ton CO₂`, 11);
  }
  addText(`   - Electricidad: ${evaluacion.carbonData.electricidad || 0} kWh`, 10);
  addText(`   - Gas: ${evaluacion.carbonData.gas || 0} kg`, 10);
  addText(`   - Diésel: ${evaluacion.carbonData.diesel || 0} litros`, 10);
  yPosition += 5;
  
  addText(`🔵 Consumo de Agua: ${evaluacion.scores.waterScore} / 100`, 12, true);
  addText(`   Consumo mensual: ${evaluacion.waterData.consumoMensual || 0} litros`, 10);
  if (evaluacion.waterData.fuentePrincipal) {
    addText(`   Fuente principal: ${evaluacion.waterData.fuentePrincipal}`, 10);
  }
  yPosition += 5;
  
  addText(`🟢 Gestión de Residuos: ${evaluacion.scores.wasteScore} / 100`, 12, true);
  addText(`   Residuos totales: ${evaluacion.wasteData.residuosTotales || 0} kg`, 10);
  addText(`   Residuos reciclados: ${evaluacion.wasteData.residuosReciclados || 0} kg`, 10);
  addText(`   Porcentaje de reciclaje: ${evaluacion.wasteData.porcentajeReciclaje?.toFixed(2) || 0}%`, 10);
  yPosition += 10;
  
  // RECOMENDACIONES
  addText('RECOMENDACIONES', 16, true, 8);
  addLine();
  
  if (evaluacion.recommendations && evaluacion.recommendations.length > 0) {
    evaluacion.recommendations.forEach((rec, index) => {
      addText(`${index + 1}. ${rec}`, 11, false, 6);
    });
  } else {
    addText('No se generaron recomendaciones específicas.', 11);
  }
  
  yPosition += 10;
  
  // INTERPRETACIÓN DE RESULTADOS
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }
  
  addText('INTERPRETACIÓN DE RESULTADOS', 16, true, 8);
  addLine();
  
  let interpretacion = '';
  if (evaluacion.finalScore >= 71) {
    interpretacion = 'La empresa demuestra un ALTO nivel de desempeño ambiental. Las prácticas actuales son efectivas y deben mantenerse. Se recomienda documentar los procesos y compartir las mejores prácticas.';
  } else if (evaluacion.finalScore >= 36) {
    interpretacion = 'La empresa presenta un nivel MEDIO de desempeño ambiental. Existen oportunidades de mejora en algunas áreas. Se recomienda implementar las acciones sugeridas de manera gradual.';
  } else {
    interpretacion = 'La empresa muestra un nivel BAJO de desempeño ambiental. Se requiere atención urgente en múltiples áreas. Se recomienda desarrollar un plan de acción inmediato y considerar asesoría externa.';
  }
  
  addText(interpretacion, 11, false, 8);
  
  // PIE DE PÁGINA
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'Este informe es generado automáticamente por AmbientAPP. Los cálculos son estimaciones basadas en factores estándar.',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // GUARDAR PDF
  const fileName = `Informe_${evaluacion.companyName.replace(/\s+/g, '_')}_${evaluacion.period}.pdf`;
  pdf.save(fileName);
};

function InformePDF({ evaluacion, children }) {
  const handleGenerarPDF = async () => {
    try {
      await generarInformePDF(evaluacion);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el informe PDF');
    }
  };
  
  return (
    <button onClick={handleGenerarPDF} className="btn-primary">
      {children || '📄 Generar Informe PDF'}
    </button>
  );
}

export default InformePDF;