export async function addPdfFooter(pdf, { empresa, fecha, totalPages }) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginX = 18;
  const posY = 284;

  // === LOGO NÍTIDO Y PROPORCIONAL ===
  const maxLogoWidth = 22; // mm
  let logoW = maxLogoWidth;
  let logoH;

  const logo = new Image();
  logo.src = "/logo-ambientapp-hd.png";

  await new Promise((resolve) => {
    logo.onload = () => {
      const ratio = logo.height / logo.width;
      logoH = logoW * ratio;
      resolve();
    };
  });

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.25);
    pdf.line(marginX, posY - 8, pageWidth - marginX, posY - 8);

    // ⬇️ LOGO PERFECTO
    pdf.addImage(logo, "PNG", marginX, posY - logoH + 5.6, logoW, logoH);

    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);

    pdf.text(`Informe creado para ${empresa}`, marginX + logoW + 4, posY);
    pdf.text(fecha, pageWidth / 2, posY, { align: "center" });
    pdf.text(`Página ${i}`, pageWidth - marginX, posY, { align: "right" });
  }
}