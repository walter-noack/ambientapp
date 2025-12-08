import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getEvaluacionById } from "../services/api";
import generarPDF from "../utils/generarPDF";

export default function GenerarPDF() {
  const { id } = useParams();
  const [estado, setEstado] = useState("Generando PDF...");

  useEffect(() => {
    async function generar() {
      try {
        setEstado("Cargando datos...");

        const data = await getEvaluacionById(id);

        if (!data) {
          setEstado("No se encontró la evaluación.");
          return;
        }

        setEstado("Generando archivo PDF...");

        await generarPDF(data);

        setEstado("PDF generado correctamente. Puedes cerrar esta ventana.");
      } catch (error) {
        console.error("Error generando PDF:", error);
        setEstado("Error generando PDF.");
      }
    }

    generar();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-pulse text-lg font-semibold text-slate-700">
          {estado}
        </div>
      </div>
    </div>
  );
}