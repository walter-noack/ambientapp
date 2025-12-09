// src/utils/exportInformeDesdeDOM.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { addPdfFooter } from "../components/pdf/PdfFooter";


/**
 * Exporta cada .pdf-page como páginas reales en A4
 * Devuelve un Blob PDF listo para descargar o comprimir
 */
export default async function exportInformeDesdeDOM({
  rootElementId = "pdf-root",
  empresa = "",
  fecha = "",
}) {
  const root = document.getElementById(rootElementId);
  if (!root) throw new Error(`No se encontró el contenedor con id="${rootElementId}"`);

  const originalBg = root.style.backgroundColor;
  root.style.backgroundColor = "#ffffff";

  try {
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    // 📌 Registrar fuentes ANTES de usarlas
    /*registerFonts(pdf);*/
    pdf.setFont("Helvetica", "normal");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pages = root.querySelectorAll(".pdf-page");

    if (!pages.length) {
      await addCanvasToPDF(pdf, root, pdfWidth);
    } else {
      let first = true;

      for (const page of pages) {
        const canvas = await html2canvas(page, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          ignoreElements: (el) => el.classList.contains("no-print"),
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (!first) pdf.addPage();
        first = false;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      }
    }

    // 🆕 Inserta footers en el PDF final (NO en el DOM)
    const totalPages = pdf.internal.getNumberOfPages();
    await addPdfFooter(pdf, { empresa, fecha, totalPages });

    return pdf.output("blob");

  } catch (error) {
    console.error("❌ Error exportando PDF:", error);
    throw error;
  } finally {
    root.style.backgroundColor = originalBg;
  }
}

async function addCanvasToPDF(pdf, element, pdfWidth) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
}