// src/pages/PreviewPDF.jsx - VERSIÓN FINAL LIMPIA
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InformePDF from "../components/pdf/InformePDF";

import { getEvaluacionById, getResiduosRep } from "../services/api";
import { calcularEmisionesCarbono } from "../utils/calculosHuella";
import { renderRadarToImage, renderStackedBarToImage } from "../utils/chartCapture";

import {
    interpretarRadar,
    interpretarCarbono,
    interpretarRep,
    analisisGlobal
} from "../utils/interpretacionesPDF";

export default function PreviewPDF() {
    const { id } = useParams();

    const [evaluacion, setEvaluacion] = useState(null);
    const [residuosRep, setResiduosRep] = useState([]);
    const [loading, setLoading] = useState(true);

    const [radarImg, setRadarImg] = useState(null);
    const [stackedImg, setStackedImg] = useState(null);

    // Cargar datos
    useEffect(() => {
        async function load() {
            try {
                const ev = await getEvaluacionById(id);
                setEvaluacion(ev);

                const empresa =
                    ev?.empresaId && ev?.empresaId !== "null"
                        ? ev.empresaId
                        : "EMPRESA_ADMIN";

                const rep = await getResiduosRep(empresa);
                setResiduosRep(rep.data || []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    // Generar imágenes de gráficos
    useEffect(() => {
        if (!evaluacion) return;

        async function generateChartImages() {
            try {
                const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});

                const radarImage = await renderRadarToImage(evaluacion.scores);
                console.log("✅ Radar generado:", radarImage ? "SI" : "NO", radarImage?.length);
                setRadarImg(radarImage);

                const stackedImage = await renderStackedBarToImage(
                    emisiones.alcance1,
                    emisiones.alcance2
                );
                console.log("✅ Stacked generado:", stackedImage ? "SI" : "NO", stackedImage?.length);
                setStackedImg(stackedImage);

            } catch (error) {
                console.error("Error generando gráficos:", error);
            }
        }

        generateChartImages();
    }, [evaluacion]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando evaluación...</p>
                </div>
            </div>
        );
    }

    if (!evaluacion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600">Error cargando evaluación.</p>
            </div>
        );
    }

    const emisiones = calcularEmisionesCarbono(evaluacion.carbonData || {});
    const textoRadar = interpretarRadar(evaluacion.scores);
    const textoCarbono = interpretarCarbono(emisiones);
    const textoRep = interpretarRep(residuosRep, evaluacion);
    const textoGlobal = analisisGlobal(evaluacion, emisiones, residuosRep);

    return (
        <div className="bg-slate-100 min-h-screen py-10">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6">

                {/* Indicador de carga de gráficos */}
                {(!radarImg || !stackedImg) && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800">
                                    Generando gráficos para el informe...
                                </p>
                                <div className="flex gap-4 mt-2 text-xs text-blue-600">
                                    <span>{radarImg ? "✓" : "⏳"} Radar Ambiental</span>
                                    <span>{stackedImg ? "✓" : "⏳"} Gráfico de Emisiones</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <InformePDF
                    evaluacion={evaluacion}
                    emisiones={emisiones}
                    residuosRep={residuosRep}
                    textoRadar={textoRadar}
                    textoCarbono={textoCarbono}
                    textoRep={textoRep}
                    textoGlobal={textoGlobal}
                    radarImg={radarImg}
                    stackedImg={stackedImg}
                />
            </div>
        </div>
    );
}