// src/components/pdf/InformePDF.jsx
import React from "react";
import { generarRecomendacionesPriorizadas } from "../../utils/recomendaciones";
import { useEffect, useState } from "react";
import { usePdfPageNumbers } from "../../hooks/usePdfPageNumbers";


function LogoAmbientAPP() {
    const [png, setPng] = useState(null);

    useEffect(() => {
        fetch("/logo-ambientapp.svg")
            .then(res => res.text())
            .then(svg => {
                const svg64 = btoa(unescape(encodeURIComponent(svg)));
                const imageSrc = `data:image/svg+xml;base64,${svg64}`;

                const img = new Image();
                img.src = imageSrc;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    setPng(canvas.toDataURL("image/png"));
                };
            });
    }, []);

    if (!png) return <div style={{ height: 110 }} />;

    return (
        <img
            src={png}
            alt="AmbientAPP"
            style={{ height: "110px", objectFit: "contain" }}
        />
    );
}

export { LogoAmbientAPP };

/**
 * INFORME PDF — versión final
 * Mantiene el estilo original, pero adaptado a:
 *  - Gráfico RADAR (radarImg)
 *  - Gráfico BARRAS APILADAS (stackedImg)
 */

export default function InformePDF({
    evaluacion,
    emisiones,
    residuosRep,
    textoRadar,
    textoCarbono,
    textoRep,
    textoGlobal,
    radarImg,
    stackedImg,
    recomendaciones = [],
    factores = [],
}) {
    const ev = evaluacion || {};
    const empresa = ev.companyName || "Empresa no definida";
    const periodo = ev.period || "Período no definido";
    const fecha = new Date().toLocaleDateString("es-CL");

    usePdfPageNumbers({ empresa, fecha });

    const totalResiduos = ev?.wasteData?.residuosTotales || 0;

    // REP
    const repUltimo = residuosRep?.[0];
    const repPct =
        repUltimo && repUltimo.cantidadGenerada
            ? (repUltimo.cantidadValorizada / repUltimo.cantidadGenerada) * 100
            : 0;

    function BadgeSVG({ text, bg, border, color }) {
        return (
            <svg
                width="68"
                height="22"
                style={{ display: "inline-block", verticalAlign: "middle" }}
            >
                <rect
                    x="0.5"
                    y="0.5"
                    width="67"
                    height="21"
                    rx="6"
                    fill={bg}
                    stroke={border}
                />
                <text
                    x="50%"
                    y="50%"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fill={color}
                    dominantBaseline="middle"
                    textAnchor="middle"
                >
                    {text}
                </text>
            </svg>
        );
    }

    function NumeroBadge({ n }) {
        return (
            <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="18" fill="#10b981" />
                <text
                    x="18"
                    y="21"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill="white"
                    fontFamily="Inter, sans-serif"
                >
                    {n}
                </text>
            </svg>
        );
    }

    function PrioridadBadgeSVG({ prioridad }) {
        const map = {
            1: { txt: "Crítica", color: "#dc2626", bg: "#fee2e2", dot: "#b91c1c" },
            2: { txt: "Alta", color: "#c2410c", bg: "#ffedd5", dot: "#ea580c" },
            3: { txt: "Media", color: "#92400e", bg: "#fef3c7", dot: "#ca8a04" },
            4: { txt: "Baja", color: "#065f46", bg: "#d1fae5", dot: "#10b981" },
        };

        const p = map[prioridad] ?? map[3];

        return (
            <svg
                width="82"
                height="26"
                viewBox="0 0 82 26"
                style={{ display: "block" }}
            >
                <rect
                    x="0"
                    y="0"
                    width="82"
                    height="26"
                    rx="8"
                    fill={p.bg}
                    stroke={p.color + "33"}
                />
                <circle cx="14" cy="13" r="5" fill={p.dot} />
                <text
                    x="32"
                    y="16"
                    fontSize="11"
                    fontWeight="600"
                    fill={p.color}
                    fontFamily="Inter, sans-serif"
                >
                    {p.txt}
                </text>
            </svg>
        );
    }

    // 🔢 Círculo verde con número centrado (para Próximos Pasos)
    function PasoNumeroSVG({ n }) {
        return (
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="12" cy="12" r="11.5" fill="#10b981" />
                <text
                    x="12"
                    y="13.5"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#ffffff"
                    fontFamily="Inter, sans-serif"
                >
                    {n}
                </text>
            </svg>
        );
    }

    // 🧩 Bloque HTML de Próximos Pasos (ya no es un SVG gigante)
    function ProximosPasosBlock() {
        const pasos = [
            "Revisar y validar las recomendaciones con el equipo directivo",
            "Asignar responsables y presupuesto para cada acción prioritaria",
            "Establecer indicadores de seguimiento (KPIs) para medir el progreso",
            "Realizar nueva evaluación en 6 meses para medir mejoras",
        ];

        return (
            <div className="pdf-next-steps">
                <h3 className="pdf-next-steps-title">
                    <span className="icon">📌</span>
                    Próximos pasos sugeridos
                </h3>

                <ul className="pdf-next-steps-list">
                    {pasos.map((texto, idx) => (
                        <li key={idx} className="pdf-next-step-item">
                            <PasoNumeroSVG n={idx + 1} />
                            <span>{texto}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    function RecomendacionCard({ rec, numero }) {
        const impactoColor = {
            "Alto": "bg-red-100 text-red-800 border-red-300",
            "Medio": "bg-yellow-100 text-yellow-800 border-yellow-300",
            "Bajo": "bg-green-100 text-green-800 border-green-300",
        };

        const facilidadColor = {
            "Alta": "bg-emerald-100 text-emerald-800 border-emerald-300",
            "Media": "bg-blue-100 text-blue-800 border-blue-300",
            "Baja": "bg-slate-100 text-slate-800 border-slate-300",
        };

        const prioridadBadge = {
            1: "🔴 Crítica",
            2: "🟠 Alta",
            3: "🟡 Media",
            4: "🟢 Baja",
        };

        function PasoNumeroSVG({ n }) {
            return (
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="11.5" fill="#10b981" />
                    <text
                        x="12"
                        y="13.5"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#ffffff"
                        fontFamily="Inter, sans-serif"
                    >
                        {n}
                    </text>
                </svg>
            );
        }

        return (
            <div className="border border-slate-300 rounded-lg p-4 py-2.5 bg-white shadow-sm avoid-break">
                <div className="flex items-start gap-3">

                    {/* Número */}
                    <div className="flex-shrink-0">
                        <NumeroBadge n={numero} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{rec.icono}</span>
                                    <h3 className="text-sm font-bold text-slate-800">{rec.titulo}</h3>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{rec.dimension}</p>
                            </div>

                            {/* PRIORIDAD */}
                            <div className="flex-shrink-0">
                                <PrioridadBadgeSVG prioridad={rec.prioridad} />
                            </div>
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                            {rec.descripcion}
                        </p>

                        {/* BADGES: Impacto / Facilidad */}
                        <div className="flex items-center gap-6 leading-none">

                            {/* IMPACTO */}
                            <BadgeSVG
                                text={rec.impacto}
                                bg={rec.impacto === "Alto" ? "#fee2e2" : rec.impacto === "Medio" ? "#fef9c3" : "#dcfce7"}
                                border={rec.impacto === "Alto" ? "#fecaca" : rec.impacto === "Medio" ? "#fde047" : "#bbf7d0"}
                                color={rec.impacto === "Alto" ? "#b91c1c" : rec.impacto === "Medio" ? "#92400e" : "#166534"}
                            />

                            {/* FACILIDAD */}
                            <BadgeSVG
                                text={rec.facilidad}
                                bg={rec.facilidad === "Alta" ? "#dcfce7" : rec.facilidad === "Media" ? "#dbeafe" : "#f1f5f9"}
                                border={rec.facilidad === "Alta" ? "#86efac" : rec.facilidad === "Media" ? "#93c5fd" : "#cbd5e1"}
                                color={rec.facilidad === "Alta" ? "#065f46" : rec.facilidad === "Media" ? "#1e40af" : "#475569"}
                            />
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-">
                            <div className="flex items-center gap-1 text-xs text-emerald-700">
                                <span className="font-semibold">💰</span>
                                <span>{rec.ahorroPotencial}</span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-600">
                                <span className="font-semibold">⏱️</span>
                                <span>{rec.plazo}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            id="pdf-root"
            className="bg-white text-slate-900 text-[11px] leading-relaxed"
            style={{
                width: "800px",
                margin: "0 auto",
                fontFamily:
                    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            {/* ========================================================= */}
            {/*                       PÁGINA 1 - PORTADA                  */}
            {/* ========================================================= */}
            <section
                className="pdf-page flex flex-col justify-between"
                style={{
                    minHeight: "1120px",
                    padding: "64px 72px",
                    pageBreakAfter: "always",
                    backgroundImage: `
                        radial-gradient(circle at 20% 10%, rgba(16,185,129,0.09), transparent 55%),
                        radial-gradient(circle at 80% 90%, rgba(37,99,235,0.08), transparent 55%),
                        repeating-linear-gradient(
                            45deg,
                            rgba(0,0,0,0.015) 0px,
                            rgba(0,0,0,0.015) 1px,
                            transparent 1px,
                            transparent 6px
                        )
                    `,
                    backgroundSize: "cover",
                }}
            >
                {/* HEADER */}
                <header className="flex items-start justify-between mb-12">
                    <LogoAmbientAPP />
                </header>

                {/* TÍTULO */}
                <div className="mt-12" style={{ maxWidth: "520px" }}>
                    <h1 className="text-[40px] font-semibold leading-tight mb-3" style={{ letterSpacing: "0.4px" }}>

                        Diagnóstico Ambiental
                    </h1>
                    <p className="text-base text-slate-600">
                        Evaluación, análisis e interpretación de los indicadores ambientales
                        generados con AmbientAPP para apoyar la gestión y toma de decisiones.
                    </p>
                    <div className="h-[1px] w-32 bg-emerald-500/40 my-6"></div>
                </div>

                {/* INFORMACIÓN */}
                <div className="grid grid-cols-2 gap-4 mt-6 max-w-xl text-sm">
                    <InfoBox label="Empresa evaluada" value={empresa} highlight />
                    <InfoBox label="Período" value={periodo} />
                    <InfoBox label="Fecha del informe" value={fecha} />
                    <InfoBox label="Generado por" value="AmbientAPP" />
                </div>

            </section>

            {/* ========================================================= */}
            {/*                 PÁGINA 2 - RESUMEN EJECUTIVO              */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px", position: "relative" }}
            >
                <HeaderSection
                    title="Resumen ejecutivo"
                    desc="Visión general del desempeño ambiental de la organización."
                    page={2}
                />


                {/* KPIs */}
                <div className="grid grid-cols-2 gap-6 mb-10">

                    <CardKPI
                        title="Huella de carbono"
                        color="emerald"
                        value={`${emisiones.totalTon.toFixed(2)} tCO₂e`}
                        desc="Emisiones totales considerando combustibles (A1) y electricidad (A2)."
                    />

                    <CardKPI
                        title="Consumo de agua"
                        color="sky"
                        value={`${ev?.waterData?.consumoMensual?.toLocaleString("es-CL") ?? "–"} L/mes`}
                        desc="Consumo mensual promedio declarado."
                    />

                    <CardKPI
                        title="Residuos generados"
                        color="lime"
                        value={`${totalResiduos.toLocaleString("es-CL")} kg/año`}
                        desc="Total de residuos sólidos declarados."
                    />

                    <CardKPI
                        title="Valorización REP"
                        color="blue"
                        value={repUltimo ? `${repPct.toFixed(1)}%` : "–"}
                        desc="Porcentaje valorizado según último registro."
                    />

                </div>

                {/* Interpretación global */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/80 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-2">
                        Interpretación general
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                        {textoGlobal}
                    </p>
                </div>

            </section>

            {/* ========================================================= */}
            {/*              PÁGINA 3 - PERFIL AMBIENTAL (RADAR)         */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px", position: "relative" }}
            >
                <HeaderSection
                    title="Perfil ambiental de la organización"
                    desc="Desempeño global en carbono, agua y residuos basado en los puntajes ambientales."
                    page={3}
                />


                <div className="grid grid-cols-[1.1fr_1.2fr] gap-10">

                    {/* RADAR */}
                    <ChartBox
                        title="Gráfico radar del desempeño"
                        desc={
                            <>
                                El radar representa visualmente el comportamiento de la organización
                                en carbono, agua y residuos. Valores más altos indican un mejor
                                desempeño relativo.
                            </>
                        }
                        img={radarImg}
                        size={340}
                    />

                    {/* INTERPRETACIÓN */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                        <h3 className="text-sm font-semibold mb-2">
                            Interpretación del perfil
                        </h3>
                        <p className="text-sm leading-relaxed">{textoRadar}</p>

                        {/* TARJETAS */}
                        <ScoreGrid scores={ev.scores} />
                    </div>
                </div>

            </section>

            {/* ========================================================= */}
            {/*           PÁGINA 4 - HUELLA DE CARBONO (STACKED BAR)     */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px", position: "relative" }}
            >
                <HeaderSection
                    title="Huella de carbono – Alcances 1 y 2"
                    desc="Análisis del aporte de combustibles (A1) y electricidad (A2) según período evaluado."
                    page={4}
                />

                <div className="grid grid-cols-[1.1fr_1.2fr] gap-10">

                    {/* STACKED BAR */}
                    <ChartBox
                        title="Distribución por Alcance (A1 / A2)"
                        desc="El gráfico muestra visualmente la participación relativa entre combustibles (A1) y electricidad (A2)."
                        img={stackedImg}
                        size={340}
                    />

                    {/* INTERPRETACIÓN */}
                    <InterpretacionCarbono emisiones={emisiones} texto={textoCarbono} />

                </div>

            </section>
            {/* ========================================================= */}
            {/*           PÁGINA 5 - GESTIÓN HÍDRICA                      */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px", position: "relative" }}
            >
                <HeaderSection
                    title="Gestión hídrica"
                    desc="Análisis del consumo de agua y desempeño en gestión del recurso hídrico."
                    page={5}
                />


                <div className="grid grid-cols-2 gap-10">

                    {/* KPIs DE AGUA */}
                    <div className="space-y-6">
                        <CardKPI
                            title="Consumo mensual"
                            color="sky"
                            value={`${(ev?.waterData?.consumoMensual || 0).toLocaleString('es-CL')} L`}
                            desc="Volumen total de agua consumida en el período evaluado"
                        />

                        <CardKPI
                            title="Intensidad hídrica"
                            color="blue"
                            value={
                                ev?.intensidadHidrica?.valor
                                    ? `${ev.intensidadHidrica.valor.toFixed(2)} ${ev.intensidadHidrica.unidad}`
                                    : "No calculada"
                            }
                            desc="Consumo de agua normalizado según unidad productiva o personas"
                        />

                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 shadow-sm">
                            <h3 className="text-sm font-semibold mb-2">Contexto</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                La intensidad hídrica permite comparar el consumo de agua entre
                                diferentes períodos o empresas del mismo sector. Un valor bajo
                                indica mayor eficiencia en el uso del recurso. Se recomienda
                                monitorear mensualmente y establecer metas de reducción progresiva.
                            </p>
                        </div>
                    </div>

                    {/* INTERPRETACIÓN */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                        <h3 className="text-sm font-semibold mb-2">Interpretación</h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                            {interpretarAgua(ev?.waterData, ev?.intensidadHidrica)}
                        </p>

                        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <h4 className="text-xs font-semibold text-blue-900 mb-2">
                                💡 Recomendaciones
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                <li>Implementar sistemas de medición y monitoreo continuo</li>
                                <li>Identificar y reparar fugas en instalaciones</li>
                                <li>Evaluar tecnologías de ahorro (grifería eficiente, riego tecnificado)</li>
                                <li>Capacitar al personal en uso responsable del agua</li>
                                <li>Considerar sistemas de reutilización y captación de aguas lluvias</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </section>

            {/* ========================================================= */}
            {/*               PÁGINA 6 - GESTIÓN DE RESIDUOS              */}
            {/* ========================================================= */}
            <section
                className="pdf-page avoid-break"
                style={{ minHeight: "1120px", padding: "56px 72px", position: "relative" }}
            >
                <HeaderSection
                    title="Gestión de residuos y Ley REP"
                    desc="Análisis de generación, valorización y cumplimiento de metas de responsabilidad extendida del productor."
                    page={6}
                />


                <div className="grid grid-cols-2 gap-10 mb-8 shadow-sm no-split">

                    {/* KPIs DE RESIDUOS */}
                    <div className="space-y-6">
                        <CardKPI
                            title="Residuos totales"
                            color="lime"
                            value={`${(totalResiduos || 0).toLocaleString('es-CL')} kg`}
                            desc="Cantidad total de residuos generados en el período"
                        />

                        <CardKPI
                            title="Residuos reciclados"
                            color="emerald"
                            value={`${(ev?.wasteData?.residuosReciclados || 0).toLocaleString('es-CL')} kg`}
                            desc="Cantidad de residuos valorizados mediante reciclaje"
                        />

                        <CardKPI
                            title="Porcentaje de reciclaje"
                            color="green"
                            value={`${calcularPorcentajeReciclaje(ev?.wasteData)}%`}
                            desc="Tasa de valorización sobre el total generado"
                        />
                    </div>

                    {/* INTERPRETACIÓN */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm shadow-sm no-split">
                        <h3 className="text-sm font-semibold mb-2">Interpretación</h3>
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">
                            {interpretarResiduos(ev?.wasteData, ev?.scores?.wasteScore)}
                        </p>

                        <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                            <h4 className="text-xs font-semibold text-emerald-900 mb-2">
                                💡 Recomendaciones
                            </h4>
                            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                                <li>Implementar segregación en origen por tipo de residuo</li>
                                <li>Establecer alianzas con gestores certificados</li>
                                <li>Capacitar al personal en manejo de residuos</li>
                                <li>Evaluar oportunidades de economía circular</li>
                                <li>Documentar y reportar valorizaciones para cumplimiento REP</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </section>

            {/* ========================================================= */}
            {/*                PAGINA 7 - LEY REP                         */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px", pageBreakBefore: "always", position: "relative" }}
            >
                <HeaderSection
                    title="Responsabilidad Extendida del Productor (REP)"
                    desc="Revisión del cumplimiento, valorización y obligaciones normativas."
                    page={7}
                />


                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 shadow-sm mb-8">
                    <h3 className="text-sm font-semibold mb-2">Estado de cumplimiento</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        {textoRep}
                    </p>

                    {residuosRep && residuosRep.length > 0 && (
                        <div className="space-y-2">
                            {residuosRep.slice(0, 4).map((rep, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between text-xs bg-white p-2 rounded border border-slate-100"
                                    style={{ pageBreakInside: "avoid" }}
                                >
                                    <span className="font-medium">{rep.producto || 'N/A'}</span>
                                    <span className="text-slate-600">{rep.anio}</span>
                                    <span className="font-semibold text-emerald-700">
                                        {rep.porcentajeValorizacion?.toFixed(1) || 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border border-amber-200 rounded-xl p-5 bg-amber-50/60 shadow-sm">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">
                        ⚠️ Productos prioritarios REP
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                        <li>Envases y embalajes</li>
                        <li>Aparatos eléctricos y electrónicos</li>
                        <li>Pilas y baterías</li>
                        <li>Neumáticos</li>
                        <li>Aceites lubricantes</li>
                        <li>Diarios y periódicos</li>
                    </ul>
                </div>

            </section>

            {/* ========================================================= */}
            {/*      PÁGINA 8 - PLAN DE ACCIÓN Y RECOMENDACIONES          */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{
                    height: "1280px",          // ALTURA FIJA REAL
                    padding: "56px 72px",
                    paddingBottom: "160px",    // ESPACIO RESERVADO PARA FOOTER
                    position: "relative",
                    overflow: "hidden"         // EVITA EMPUJES
                }}
            >
                <HeaderSection
                    title="Plan de acción recomendado"
                    desc="Recomendaciones priorizadas para mejorar el desempeño ambiental de la organización."
                    page={8}
                />

                <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Basado en los resultados de su evaluación ambiental, hemos identificado las siguientes
                        oportunidades de mejora <strong>priorizadas por impacto y facilidad de implementación</strong>.
                    </p>
                </div>

                {(() => {
                    const recomendacionesFull = generarRecomendacionesPriorizadas(ev);
                    const PAGINA_MAX = 4;

                    const primeras = recomendacionesFull.slice(0, PAGINA_MAX);
                    const restantes = recomendacionesFull.slice(PAGINA_MAX);

                    return (
                        <>
                            <div className="space-y-3">
                                {primeras.map((rec, idx) => (
                                    <RecomendacionCard
                                        key={idx}
                                        rec={rec}
                                        numero={idx + 1}
                                    />
                                ))}
                            </div>



                        </>
                    );
                })()}

                <div style={{ height: "48px" }} />   {/* 👈 BUFFER REAL NECESARIO */}

            </section>


            {/* ========================================================= */}
            {/*    PÁGINA 9 - CONTINUACIÓN + PRÓXIMOS PASOS                */}
            {/* ========================================================= */}
            {(() => {
                const recomendacionesFull = generarRecomendacionesPriorizadas(ev);
                const PAGINA_MAX = 4;

                if (recomendacionesFull.length <= PAGINA_MAX) return null;

                const restantes = recomendacionesFull.slice(PAGINA_MAX);

                return (
                    <section
                        className="pdf-page"
                        style={{
                            height: "1280px",          // ALTURA FIJA REAL
                            padding: "56px 72px",
                            paddingBottom: "160px",
                            position: "relative",
                            overflow: "hidden",
                            pageBreakBefore: "always"
                        }}
                    >
                        <HeaderSection
                            title="Plan de acción recomendado (continuación)"
                            desc="Recomendaciones adicionales y próximos pasos sugeridos."
                            page={9}
                        />

                        <div className="space-y-3">
                            {restantes.map((rec, idx) => (
                                <RecomendacionCard
                                    key={idx}
                                    rec={rec}
                                    numero={PAGINA_MAX + idx + 1}
                                />
                            ))}
                        </div>

                        <div
                            className="avoid-break"
                            style={{
                                marginTop: "28px",
                                pageBreakInside: "avoid",
                                breakInside: "avoid"
                            }}
                        >
                            <ProximosPasosBlock />
                        </div>

                        <div style={{ height: "48px" }} />

                    </section>
                );
            })()}

        </div>
    );
}


/* ===================================================================== */
/*                          COMPONENTES AUXILIARES                       */
/* ===================================================================== */

function InfoBox({ label, value, highlight }) {
    return (
        <div className={`border rounded-xl p-3 ${highlight ? "border-emerald-600/40" : "border-slate-200"}`}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    );
}

function HeaderSection({ title, desc, page }) {
    return (
        <>
            <header className="mb-10">
                <h2 className="text-2xl font-semibold mb-1" style={{ letterSpacing: "0.3px" }}>{title}</h2>
                <p className="text-xs text-slate-500">{desc}</p>
                <div className="h-[1px] bg-slate-200 w-full mt-4" />
            </header>
        </>
    );
}

function CardKPI({ title, color, value, desc }) {
    return (
        <div className={`border border-${color}-200 rounded-xl p-5 bg-${color}-50/60 shadow-sm`}>
            <p className={`text-[10px] uppercase tracking-[0.18em] text-${color}-700 font-semibold mb-1`}>
                {title}
            </p>
            <p className={`text-3xl font-semibold text-${color}-900`}>{value}</p>
            <p className="text-[11px] text-slate-600 mt-1">{desc}</p>
        </div>
    );
}

function ChartBox({ title, desc, img, size }) {
    return (
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 shadow-sm">
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-1">{desc}</p>

            <div className="w-full flex justify-center mt-1">
                {img ? (
                    <img
                        src={img}
                        style={{ width: size, height: size, objectFit: "contain" }}
                    />
                ) : (
                    <p className="text-xs text-slate-400 italic">Cargando gráfico…</p>
                )}
            </div>
        </div>
    );
}

function ScoreGrid({ scores }) {
    return (
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">

            <ScoreCard title="Carbono" color="emerald" value={scores?.carbonScore ?? 0} />
            <ScoreCard title="Agua" color="sky" value={scores?.waterScore ?? 0} />
            <ScoreCard title="Residuos" color="lime" value={scores?.wasteScore ?? 0} />

        </div>
    );
}

function ScoreCard({ title, color, value }) {
    return (
        <div className={`rounded-xl border border-${color}-200 bg-${color}-50/50 px-3 py-4`}>
            <p className={`text-[10px] uppercase tracking-[0.16em] text-${color}-700`}>{title}</p>
            <p className={`text-xl font-semibold text-${color}-900 mt-1`}>{value}</p>
        </div>
    );
}

function InterpretacionCarbono({ emisiones, texto }) {
    return (
        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Interpretación de las emisiones</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{texto}</p>

            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <KPIBox title="Total" value={emisiones.totalTon.toFixed(2)} unit="tCO₂e" />
                <KPIBox
                    title="A1"
                    value={(emisiones.alcance1 / 1000).toFixed(2)}
                    unit={`tCO₂e (${((emisiones.alcance1 / emisiones.totalKg) * 100).toFixed(1)}%)`}
                    color="emerald"
                />
                <KPIBox
                    title="A2"
                    value={(emisiones.alcance2 / 1000).toFixed(2)}
                    unit={`tCO₂e (${((emisiones.alcance2 / emisiones.totalKg) * 100).toFixed(1)}%)`}
                    color="blue"
                />
            </div>
        </div>
    );
}

function KPIBox({ title, value, unit, color }) {
    const border = color ? `border-${color}-200` : "border-slate-200";
    const bg = color ? `bg-${color}-50` : "bg-slate-50";
    const text = color ? `text-${color}-900` : "text-slate-900";

    return (
        <div className={`rounded-xl ${border} ${bg} px-3 py-4`}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">{title}</p>
            <p className={`text-xl font-semibold ${text} mt-1`}>{value}</p>
            <p className="text-[10px] text-slate-500">{unit}</p>
        </div>
    );
}


// Funciones auxiliares para interpretación
function interpretarAgua(waterData, intensidadHidrica) {
    const consumo = waterData?.consumoMensual || 0;

    if (consumo === 0) {
        return "No se registra consumo de agua para el período evaluado. Se recomienda verificar la calidad de los datos ingresados.";
    }

    let textoIntensidad = "";

    if (intensidadHidrica?.valor && intensidadHidrica?.unidad) {
        const valor = intensidadHidrica.valor.toFixed(2);
        const unidad = intensidadHidrica.unidad;

        textoIntensidad = ` La intensidad hídrica calculada es de ${valor} ${unidad}.`;

        // Interpretación según tipo de intensidad
        if (unidad.includes("persona")) {
            if (intensidadHidrica.valor > 80) {
                textoIntensidad += " Este valor es alto, sugiriendo oportunidades de mejora en eficiencia.";
            } else if (intensidadHidrica.valor > 40) {
                textoIntensidad += " Este valor es moderado, con margen para optimización.";
            } else {
                textoIntensidad += " Este valor refleja un uso eficiente del recurso hídrico.";
            }
        } else {
            // Por unidad de producción
            if (intensidadHidrica.valor > 50) {
                textoIntensidad += " Este valor es alto, sugiriendo oportunidades de mejora en eficiencia.";
            } else if (intensidadHidrica.valor > 20) {
                textoIntensidad += " Este valor es moderado, con margen para optimización.";
            } else {
                textoIntensidad += " Este valor refleja un uso eficiente del recurso hídrico.";
            }
        }
    } else {
        textoIntensidad = " No se ha calculado la intensidad hídrica. Se recomienda definir una unidad de normalización (producción o personas) para facilitar el seguimiento y comparación.";
    }

    return `El consumo mensual registrado es de ${consumo.toLocaleString('es-CL')} litros.${textoIntensidad} Se recomienda establecer indicadores de consumo y monitorear tendencias mensuales.`;
}

function interpretarResiduos(wasteData, wasteScore) {
    const total = wasteData?.residuosTotales || 0;
    const reciclados = wasteData?.residuosReciclados || 0;

    if (total === 0) {
        return "No se registra generación de residuos para el período evaluado. Se recomienda verificar la calidad de los datos ingresados.";
    }

    const porcentaje = total > 0 ? ((reciclados / total) * 100).toFixed(1) : 0;

    let nivel = "";
    if (wasteScore >= 80) {
        nivel = "excelente, con una alta tasa de valorización";
    } else if (wasteScore >= 60) {
        nivel = "intermedio, con oportunidades de mejora en segregación y valorización";
    } else {
        nivel = "bajo, requiriendo acciones urgentes para mejorar la gestión de residuos";
    }

    return `Se generaron ${total.toLocaleString('es-CL')} kg de residuos, de los cuales ${reciclados.toLocaleString('es-CL')} kg fueron reciclados (${porcentaje}%). El score de ${wasteScore} puntos refleja un desempeño ${nivel}. Se recomienda implementar un sistema de gestión integral de residuos.`;
}

function calcularPorcentajeReciclaje(wasteData) {
    const total = wasteData?.residuosTotales || 0;
    const reciclados = wasteData?.residuosReciclados || 0;

    if (total === 0) return "0.0";

    return ((reciclados / total) * 100).toFixed(1);
}