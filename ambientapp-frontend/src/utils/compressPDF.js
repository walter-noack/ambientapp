// src/utils/compressPDF.js
import { PDFDocument } from "pdf-lib";
import UPNG from "upng-js";

/**
 * Comprime imágenes PNG dentro del PDF sin alterar textos ni vectores.
 * Retorna un Blob listo para ser descargado.
 *
 * @param {Blob} pdfBlob - PDF original
 * @param {number} quality - menor = más compresión (por defecto 180)
 */
export async function compressPDF(pdfBlob, quality = 180) {
    // Cargar PDF original
    const pdfBytes = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const xObjects = page.node.normalizedEntries().XObject;
        if (!xObjects) continue;

        for (const key of Object.keys(xObjects)) {
            const image = xObjects[key];
            const raw = image.getBytes?.();
            if (!raw) continue; // no es imagen

            try {
                const img = UPNG.decode(raw);
                const compressed = UPNG.encode([img], img.width, img.height, quality);

                if (image.setBytes) {
                    image.setBytes(compressed);
                }
            } catch (err) {
                console.warn("No se pudo comprimir imagen:", err);
            }
        }
    }

    // Guardar el PDF comprimido como ArrayBuffer
    const compressedBytes = await pdfDoc.save();

    // 🔥 CLAVE: envolver en Blob con tipo correcto
    return new Blob([compressedBytes], { type: "application/pdf" });
}