// src/components/pdf/InformePDF.jsx
import React from "react";
import { generarRecomendacionesPriorizadas } from "../../utils/recomendaciones";

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

    const totalResiduos = ev?.wasteData?.residuosTotales || 0;

    // REP
    const repUltimo = residuosRep?.[0];
    const repPct =
        repUltimo && repUltimo.cantidadGenerada
            ? (repUltimo.cantidadValorizada / repUltimo.cantidadGenerada) * 100
            : 0;

    function RecomendacionCard({ rec, numero }) {
        const impactoColor = {
            "Alto": "bg-red-100 text-red-800 border-red-300",
            "Medio": "bg-yellow-100 text-yellow-800 border-yellow-300",
            "Bajo": "bg-green-100 text-green-800 border-green-300"
        };

        const facilidadColor = {
            "Alta": "bg-emerald-100 text-emerald-800",
            "Media": "bg-blue-100 text-blue-800",
            "Baja": "bg-slate-100 text-slate-800"
        };

        const prioridadBadge = {
            1: "🔴 Crítica",
            2: "🟠 Alta",
            3: "🟡 Media",
            4: "🟢 Baja"
        };

        return (
            <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                    {/* Número */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                        {numero}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{rec.icono}</span>
                                    <h3 className="text-sm font-bold text-slate-800">{rec.titulo}</h3>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{rec.dimension}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-slate-700">
                                {prioridadBadge[rec.prioridad]}
                            </span>
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                            {rec.descripcion}
                        </p>

                        {/* Badges de impacto y facilidad */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600 font-medium">Impacto:</span>
                                <span className={`text-xs px-2 py-0.5 rounded border ${impactoColor[rec.impacto]}`}>
                                    {rec.impacto}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600 font-medium">Facilidad:</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${facilidadColor[rec.facilidad]}`}>
                                    {rec.facilidad}
                                </span>
                            </div>
                        </div>

                        {/* Footer con ahorro y plazo */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
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
                    <img
                        src="/logo-ambientapp.svg"
                        alt="AmbientAPP"
                        style={{ height: "110px", objectFit: "contain" }}
                    />
                </header>

                {/* TÍTULO */}
                <div className="mt-12" style={{ maxWidth: "520px" }}>
                    <h1 className="text-[40px] font-semibold leading-tight mb-3">
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

                <footer className="mt-10 text-[10px] text-slate-500">
                    Informe generado automáticamente por AmbientAPP
                </footer>
            </section>

            {/* ========================================================= */}
            {/*                 PÁGINA 2 - RESUMEN EJECUTIVO              */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px" }}
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
                style={{ minHeight: "1120px", padding: "56px 72px" }}
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
                style={{ minHeight: "1120px", padding: "56px 72px" }}
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
                style={{ minHeight: "1120px", padding: "56px 72px" }}
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
            {/*           PÁGINA 6 - GESTIÓN DE RESIDUOS + LEY REP       */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px" }}
            >
                <HeaderSection
                    title="Gestión de residuos y Ley REP"
                    desc="Análisis de generación, valorización y cumplimiento de metas de responsabilidad extendida del productor."
                    page={6}
                />

                <div className="grid grid-cols-2 gap-10 mb-8">

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
                    <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
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

                {/* SECCIÓN LEY REP */}
                <div className="border-t-2 border-slate-200 pt-8">
                    <h3 className="text-lg font-semibold mb-4">Ley de Responsabilidad Extendida del Productor (REP)</h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60 shadow-sm">
                            <h4 className="text-sm font-semibold mb-2">Estado de cumplimiento</h4>
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                {textoRep}
                            </p>

                            {residuosRep && residuosRep.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">
                                        Últimos registros REP:
                                    </p>
                                    <div className="space-y-2">
                                        {residuosRep.slice(0, 3).map((rep, idx) => (
                                            <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border border-slate-100">
                                                <span className="font-medium">{rep.producto || 'N/A'}</span>
                                                <span className="text-slate-600">{rep.anio}</span>
                                                <span className="font-semibold text-emerald-700">
                                                    {rep.porcentajeValorizacion?.toFixed(1) || 0}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
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
                            <p className="text-xs text-amber-700 mt-3 leading-relaxed">
                                Las empresas que comercialicen estos productos deben cumplir
                                metas anuales de recolección y valorización establecidas por
                                el Ministerio del Medio Ambiente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {/* ========================================================= */}
            {/*      PÁGINA 7 - PLAN DE ACCIÓN Y RECOMENDACIONES         */}
            {/* ========================================================= */}
            <section
                className="pdf-page"
                style={{ minHeight: "1120px", padding: "56px 72px" }}
            >
                <HeaderSection
                    title="Plan de acción recomendado"
                    desc="Recomendaciones priorizadas para mejorar el desempeño ambiental de la organización."
                    page={7}
                />

                {/* INTRODUCCIÓN */}
                <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Basado en los resultados de su evaluación ambiental, hemos identificado las siguientes
                        oportunidades de mejora <strong>priorizadas por impacto y facilidad de implementación</strong>.
                        Cada recomendación incluye estimación de ahorro potencial y plazo sugerido.
                    </p>
                </div>

                {/* RECOMENDACIONES PRIORIZADAS */}
                <div className="space-y-4">
                    {generarRecomendacionesPriorizadas(ev).slice(0, 6).map((rec, idx) => (
                        <RecomendacionCard key={idx} rec={rec} numero={idx + 1} />
                    ))}
                </div>

                {/* FOOTER CON PRÓXIMOS PASOS */}
                <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">📌 Próximos pasos sugeridos</h3>
                    <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside">
                        <li>Revisar y validar las recomendaciones con el equipo directivo</li>
                        <li>Asignar responsables y presupuesto para cada acción prioritaria</li>
                        <li>Establecer indicadores de seguimiento (KPIs) para medir el progreso</li>
                        <li>Realizar nueva evaluación en 6 meses para medir mejoras</li>
                    </ol>
                </div>
            </section>
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
                <h2 className="text-2xl font-semibold mb-1">{title}</h2>
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