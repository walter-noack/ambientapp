// src/utils/exportInformeDesdeDOM.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Exporta cada .pdf-page como página independiente en un PDF A4
 * Mantiene proporciones exactas del diseño: ancho 800px → A4 (210mm)
 */
export default async function exportInformeDesdeDOM({
  fileName = "ambientapp_informe.pdf",
  rootElementId = "pdf-root",
}) {
  const root = document.getElementById(rootElementId);
  if (!root) throw new Error(`No se encontró el contenedor con id="${rootElementId}"`);

  const originalBg = root.style.backgroundColor;
  root.style.backgroundColor = "#ffffff";

  try {
    // PDF en A4, portrait
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pages = root.querySelectorAll(".pdf-page");

    // Si no hay secciones, exporta todo el root
    if (!pages.length) {
      await exportSingleCanvas(pdf, root, pdfWidth);
      pdf.save(fileName);
      return;
    }

    let isFirst = true;

    for (const page of pages) {
      const canvas = await html2canvas(page, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        imageTimeout: 2000,
        ignoreElements: (el) => el.classList.contains("no-print"),
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Escala proporcional

      if (!isFirst) pdf.addPage();
      isFirst = false;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(fileName);
    console.log(`📄 PDF "${fileName}" generado con ${pages.length} páginas`);
  } catch (error) {
    console.error("❌ Error al exportar PDF:", error);
    throw error;
  } finally {
    root.style.backgroundColor = originalBg;
  }
}

async function exportSingleCanvas(pdf, element, pdfWidth) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
}