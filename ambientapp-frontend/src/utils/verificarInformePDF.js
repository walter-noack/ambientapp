export default function verificarInformePDF(rootId = "pdf-root") {
  const root = document.getElementById(rootId);

  if (!root) {
    throw new Error(
      `❌ No existe el contenedor #${rootId}. Debe estar en InformePDF.jsx`
    );
  }

  const pages = root.querySelectorAll(".pdf-page");
  if (!pages.length) {
    throw new Error(
      `❌ No existen secciones con clase .pdf-page.\nCada página del informe debe envolverse así:\n<section class="pdf-page"> ... </section>`
    );
  }

  pages.forEach((p, i) => {
    const h = p.offsetHeight;
    if (h < 900 || h > 1600) {
      console.warn(
        `⚠️ La página ${i + 1} tiene una altura inusual (${h}px). Verifica márgenes y contenido.`
      );
    }
  });

  const w = root.offsetWidth;
  if (w !== 800) {
    console.warn(
      `⚠️ El ancho del informe es ${w}px y debería ser 800px para PDF perfecto.\nCorrige en InformePDF.jsx → style={{ width: "800px" }}`
    );
  }

  console.log("✅ InformePDF listo para exportar.");
}