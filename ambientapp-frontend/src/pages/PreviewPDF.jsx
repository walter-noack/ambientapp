// src/pages/PreviewPDF.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InformePDF from "../components/pdf/InformePDF";
import exportInformeDesdeDOM from "../utils/exportInformedesdeDOM";
import verificarInformePDF from "../utils/verificarInformePDF";
import "../styles/pdf.css";
import { compressPDF } from "../utils/compressPDF";

import { getEvaluacionById, getResiduosRep } from "../services/api";
import { calcularEmisionesCarbono } from "../utils/calculosHuella";
import { renderRadarToImage, renderStackedBarToImage } from "../utils/chartCapture";
import {
  interpretarRadar,
  interpretarCarbono,
  interpretarRep,
  analisisGlobal,
} from "../utils/InterpretacionesPDF";

export default function PreviewPDF() {
  const { id } = useParams();

  const [evaluacion, setEvaluacion] = useState(null);
  const [residuosRep, setResiduosRep] = useState([]);
  const [radarImg, setRadarImg] = useState(null);
  const [stackedImg, setStackedImg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const ev = await getEvaluacionById(id);
        if (!mounted) return;
        setEvaluacion(ev);

        const empresaId = ev?.empresaId && ev.empresaId !== "null" ? ev.empresaId : "EMPRESA_ADMIN";
        try {
          const rep = await getResiduosRep(empresaId);
          if (mounted) setResiduosRep(Array.isArray(rep?.data) ? rep.data : []);
        } catch {
          if (mounted) setResiduosRep([]);
        }

        const emis = calcularEmisionesCarbono(ev.carbonData || {});
        const [radar, stacked] = await Promise.all([
          renderRadarToImage(ev.scores || {}),
          renderStackedBarToImage(emis.alcance1, emis.alcance2),
        ]);

        if (!mounted) return;
        setRadarImg(radar);
        setStackedImg(stacked);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  if (loading || !evaluacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white shadow-md px-5 py-4 rounded-lg">
          Cargando informe ambiental...
        </div>
      </div>
    );
  }

  const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});
  const textoRadar = interpretarRadar(evaluacion.scores);
  const textoCarbono = interpretarCarbono(emisiones);
  const textoRep = interpretarRep(residuosRep, evaluacion);
  const textoGlobal = analisisGlobal(evaluacion, emisiones, residuosRep);

  const handleExport = async () => {
    try {
      verificarInformePDF("pdf-root");
      setExporting(true);

      // ⬅️ 1) Genera PDF desde el DOM y devuelve un Blob
      const pdfBlob = await exportInformeDesdeDOM({
        rootElementId: "pdf-root",
        empresa: evaluacion.companyName,
        fecha: new Date().toLocaleDateString("es-CL"),
      });

      console.log("📦 PDF original:", pdfBlob.size / 1024 / 1024, "MB");

      // ⬅️ 2) Comprimir PDF (devuelve un Blob)
      const compressedBlob = await compressPDF(pdfBlob);

      console.log("🔽 PDF comprimido:", compressedBlob.size / 1024 / 1024, "MB");

      // ⬅️ 3) Descargar el PDF comprimido
      const url = URL.createObjectURL(compressedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ambientapp_informe_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-3">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Vista previa del informe</h1>
            <p className="text-xs text-slate-500">
              Lo que ves aquí es exactamente lo que se exportará en PDF.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || !radarImg || !stackedImg}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-colors 
              ${exporting || !radarImg || !stackedImg
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {exporting ? "Generando..." : "📄 Exportar PDF"}
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-xl p-4">
          <InformePDF
            evaluacion={evaluacion}
            emisiones={emisiones}
            residuosRep={residuosRep}
            radarImg={radarImg}
            stackedImg={stackedImg}
            textoRadar={textoRadar}
            textoCarbono={textoCarbono}
            textoRep={textoRep}
            textoGlobal={textoGlobal}
          />
        </div>

      </div>
    </div>
  );
}