// src/components/pdf/PdfFooter.jsx
import React, { useEffect, useState } from "react";

/**
 * Footer para páginas PDF
 * Convierte el SVG /public/logo-ambientapp.svg a PNG antes de imprimir
 */

export default function PdfFooter({ page, empresa, fecha }) {
    const [logoPng, setLogoPng] = useState(null);

    useEffect(() => {
        fetch("/logo-ambientapp.svg")
            .then(res => res.text())
            .then(svg => {
                const svg64 = btoa(unescape(encodeURIComponent(svg)));
                const src = `data:image/svg+xml;base64,${svg64}`;

                const img = new Image();
                img.src = src;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    setLogoPng(canvas.toDataURL("image/png"));
                };
            });
    }, []);

    return (
        <footer
            style={{
                position: "absolute",
                bottom: "24px",
                left: "56px",
                right: "56px",
                height: "24px",
                fontSize: "9px",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "6px",
                fontFamily: "'Inter', sans-serif",
                backgroundColor: "white",
            }}
        >
            {/* Empresa + logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {logoPng && (
                    <img
                        src={logoPng}
                        alt="AmbientAPP"
                        style={{
                            height: "35px",
                            objectFit: "contain",
                            opacity: 0.9,
                        }}
                    />
                )}
                <span style={{ fontWeight: 500 }}>Informe creado para 
                    {empresa}</span>
            </div>

            {/* Fecha */}
            <span>{fecha}</span>

            {/* Página */}
            <span className="pdf-footer-number" style={{ fontFeatureSettings: '"tnum"' }}>
                Página {page}
            </span>
        </footer>
    );
}