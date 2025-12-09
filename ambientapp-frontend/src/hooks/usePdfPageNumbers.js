import { useEffect } from "react";

/**
 * Asigna número de página a cada sección con clase .pdf-page
 * Debe ejecutarse dentro del componente principal del PDF
 */
export function usePdfPageNumbers({ empresa, fecha }) {
  useEffect(() => {
    // Espera al render completo del DOM
    setTimeout(() => {
      const pages = document.querySelectorAll(".pdf-page");

      pages.forEach((pageEl, index) => {
        // Guarda número en atributo data-page
        pageEl.dataset.pageNumber = index + 1;

        // Si el footer existe en esa página, actualiza el número mostrado
        const footer = pageEl.querySelector(".pdf-footer-number");
        if (footer) footer.textContent = `Página ${index + 1}`;
      });

      console.log(
        "📄 Footers encontrados:",
        [...document.querySelectorAll(".pdf-footer-number")].map(
          (n) => n.textContent
        )
      );
    }, 150); // pequeño delay para evitar race conditions con gráficos
  }, [empresa, fecha]);
}