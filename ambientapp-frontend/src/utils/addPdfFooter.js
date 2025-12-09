import jsPDF from "jspdf";

export async function addPdfFooter(pdf, { empresa, fecha, totalPages }) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 18;   // Distancia desde borde
  const posY = 283;     // ⬅️ Footer estable (A4 = 297mm → 297 - 14)

  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    // Línea superior
    pdf.setDrawColor(220, 226, 233);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, posY - 5, pageWidth - marginX, posY - 5);

    // Empresa
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Informe creado para ${empresa}`, marginX, posY);

    // Fecha
    pdf.text(fecha, pageWidth / 2, posY, { align: "center" });

    // Número de página
    pdf.text(`Página ${i}`, pageWidth - marginX, posY, { align: "right" });
  }
}