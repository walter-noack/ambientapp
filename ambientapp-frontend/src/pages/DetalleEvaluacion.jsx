import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEvaluacionById } from "../services/api";
import BarraAmbiental from "../components/BarraAmbiental";
import { getResiduosRep } from "../services/api";
import { Chart } from "chart.js/auto";

export default function DetalleEvaluacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [loading, setLoading] = useState(true);

  // REP
  const [residuosRep, setResiduosRep] = useState([]);
  const [repLoaded, setRepLoaded] = useState(false);

  // Gráficos instancias (para destruirlos antes de redibujar)
  let graficoCarbono = null;
  let graficoRepBarras = null;
  let graficoRepLineas = null;

  // ======================================================
  // 📌 CARGAR EVALUACIÓN + REP
  // ======================================================
  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluacionById(id);
        setEvaluacion(data);

        // Cargar REP por empresa
        if (data?.empresaId) {
          const repData = await getResiduosRep(data.empresaId);
          setResiduosRep(repData.data || []);
          setRepLoaded(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error cargando evaluación:", error);
      }
    }

    load();
  }, [id]);

  // ======================================================
  // 📌 RENDER GRÁFICOS CUANDO REP SE CARGA
  // ======================================================
  useEffect(() => {
    if (!repLoaded) return;

    // Destruir gráficos previos para evitar superposición
    if (graficoRepBarras) graficoRepBarras.destroy();
    if (graficoRepLineas) graficoRepLineas.destroy();

    // === Dataset REP ===
    const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
    const productos = [...new Set(residuosRep.map((r) => r.producto))];

    // --------------- GRAFICO REP BARRAS (por año/producto) ---------------
    const ctxBarras = document.getElementById("graficoRepBarras");
    graficoRepBarras = new Chart(ctxBarras, {
      type: "bar",
      data: {
        labels: años,
        datasets: productos.map((prod) => ({
          label: prod,
          data: años.map(
            (a) =>
              residuosRep.find((r) => r.anio === a && r.producto === prod)
                ?.cantidadGenerada || 0
          ),
          backgroundColor: "rgba(16,185,129,0.5)",
          borderColor: "#10b981",
          borderWidth: 1.5,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // --------------- GRAFICO REP LÍNEAS (evolución porcentajes) ---------------
    const ctxLineas = document.getElementById("graficoRepLineas");
    graficoRepLineas = new Chart(ctxLineas, {
      type: "line",
      data: {
        labels: años,
        datasets: productos.map((prod) => ({
          label: `% Valorización — ${prod}`,
          data: años.map(
            (a) =>
              residuosRep.find((r) => r.anio === a && r.producto === prod)
                ?.porcentajeValorizacion || 0
          ),
          borderColor: "#3b82f6",
          borderWidth: 3,
          tension: 0.25,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    });
  }, [repLoaded, residuosRep]);

  // ======================================================
  // 📌 RENDER GRÁFICO HUELLAS (DONUT)
  // ======================================================
  useEffect(() => {
    if (!evaluacion) return;

    const emisiones = evaluacion.carbonData?.emisiones;
    if (!emisiones) return;

    const alcance1 = emisiones.alcance1;
    const alcance2 = emisiones.alcance2;

    // Destruir previo
    if (graficoCarbono) graficoCarbono.destroy();

    const ctx = document.getElementById("graficoCarbono");

    graficoCarbono = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Alcance 1", "Alcance 2"],
        datasets: [
          {
            data: [alcance1, alcance2],
            backgroundColor: ["#10b981", "#3b82f6"],
            hoverOffset: 12,
          },
        ],
      },
      options: {
        cutout: "60%",
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) {
                if (ctx.label === "Alcance 1") {
                  const d = emisiones.detalle;
                  return [
                    `Alcance 1: ${ctx.raw.toFixed(3)} tCO₂e`,
                    `• Gas: ${d.gas} t`,
                    `• Diesel: ${d.diesel} t`,
                    `• Bencina: ${d.bencina} t`,
                  ];
                }
                if (ctx.label === "Alcance 2") {
                  const d = emisiones.detalle;
                  return [
                    `Alcance 2: ${ctx.raw.toFixed(3)} tCO₂e`,
                    `• Electricidad: ${d.electricidad} t`,
                  ];
                }
              },
            },
          },
        },
      },
    });
  }, [evaluacion]);

  // ======================================================
  // 📌 CARGANDO / NO ENCONTRADA
  // ======================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-green-500 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <p className="text-center text-red-500 mt-10">
        Evaluación no encontrada.
      </p>
    );
  }

  const ev = evaluacion;
  // Colores por nivel
  const nivelColores = {
    Avanzado: "#0284C7",
    Intermedio: "#F59E0B",
    Básico: "#DC2626",
    Bajo: "#7F1D1D",
  };

  const colorNivel = nivelColores[ev.nivel] || "#6B7280";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold text-slate-800">Detalle de Evaluación</h1>

      {/* CONTENIDO */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-slate-200 space-y-10">

        {/* ENCABEZADO */}
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{ev.companyName}</h2>
            <p className="text-slate-600">Periodo: {ev.period}</p>
          </div>

          <div
            className="px-5 py-3 rounded-xl border text-right shadow-sm"
            style={{ borderColor: colorNivel }}
          >
            <p className="text-lg font-bold" style={{ color: colorNivel }}>
              {ev.finalScore} / 100
            </p>
            <p className="text-sm font-semibold" style={{ color: colorNivel }}>
              Nivel {ev.nivel}
            </p>
          </div>
        </div>

        {/* Barra Ambiental */}
        <BarraAmbiental score={ev.finalScore} nivel={ev.nivel} />

        {/* TARJETAS SCORE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 bg-slate-50 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-500 uppercase">Carbono</p>
            <p className="font-bold text-lg">{ev.scores.carbonScore} pts</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-500 uppercase">Agua</p>
            <p className="font-bold text-lg">{ev.scores.waterScore} pts</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-500 uppercase">Residuos</p>
            <p className="font-bold text-lg">{ev.scores.wasteScore} pts</p>
          </div>

        </div>

        {/* --- SECCIÓN HUELLAS DE CARBONO --- */}
        <div className="mt-10 p-6 bg-slate-50 rounded-xl border">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Huella de Carbono – Alcances 1 y 2
          </h3>

          <p className="text-slate-700 mb-4">
            Este gráfico muestra la distribución de las emisiones entre los dos alcances
            obligatorios según el estándar chileno: combustibles (Alcance 1) y electricidad (Alcance 2).
          </p>

          <div className="relative w-full flex justify-center">
            <canvas id="graficoCarbono" height="200"></canvas>

            {/* Texto al centro del donut */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">
                  {(ev.carbonData?.emisiones?.total || 0).toFixed(2)} tCO₂e
                </p>
              </div>
            </div>
          </div>

          {/* Leyenda propia */}
          <div className="flex justify-center gap-6 mt-4 text-sm text-slate-600">
            <span>🟩 Alcance 1 (Combustibles)</span>
            <span>🟦 Alcance 2 (Electricidad)</span>
          </div>
        </div>

        {/* --- SECCIÓN LEY REP --- */}
        {repLoaded && residuosRep.length > 0 && (
          <div className="mt-12 p-6 bg-slate-50 border rounded-xl shadow">

            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              Gestión de Residuos – Ley REP
            </h3>

            {/* TABLA RESUMEN */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-2 text-slate-800">
                Último registro disponible
              </h4>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <p><strong>Producto:</strong> {residuosRep[0].producto}</p>
                <p><strong>Año:</strong> {residuosRep[0].anio}</p>
                <p><strong>Generado:</strong> {residuosRep[0].cantidadGenerada} kg</p>
                <p><strong>Valorizado:</strong> {residuosRep[0].cantidadValorizada} kg</p>
                <p>
                  <strong>% Valorización:</strong>{" "}
                  {residuosRep[0].porcentajeValorizacion.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* =====================  DOS GRÁFICOS LADO A LADO  ===================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

              {/* ------------------ DONUT: HUELLA DE CARBONO ------------------ */}
              <div className="p-6 bg-slate-50 rounded-xl border shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Huella de Carbono (Alcances 1 y 2)
                </h3>

                <div className="relative w-full flex justify-center">
                  <canvas id="graficoCarbono" height="200"></canvas>

                  {/* Texto al centro del donut */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="text-xl font-bold text-slate-900">
                        {(ev.carbonData?.emisiones?.total || 0).toFixed(2)} tCO₂e
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="flex justify-center gap-6 mt-4 text-sm text-slate-600">
                  <span>🟩 Alcance 1 (Combustibles)</span>
                  <span>🟦 Alcance 2 (Electricidad)</span>
                </div>
              </div>

              {/* ------------------ BARRAS: LEY REP ------------------ */}
              <div className="p-6 bg-slate-50 rounded-xl border shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Gestión de Residuos – Ley REP
                </h3>

                <p className="text-sm text-slate-600 mb-3">
                  Comparación de residuos generados por producto prioritario (solo año coincidente).
                </p>

                <canvas id="graficoRepBarras" height="200"></canvas>

                {/* Gráfico de líneas (solo si hay más de 1 año) */}
                {residuosRep.length > 1 && (
                  <div className="mt-8">
                    <h4 className="text-md font-semibold mb-2 text-slate-700">
                      Evolución histórica (% de valorización)
                    </h4>
                    <canvas id="graficoRepLineas" height="160"></canvas>
                  </div>
                )}
              </div>
            </div>
            {/* =====================  FIN DOS GRÁFICOS  ===================== */}

          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex flex-col gap-3 mt-4 max-w-sm mx-auto">
        <button
          onClick={() => navigate("/evaluaciones")}
          className="btn-secondary w-full"
        >
          ← Volver
        </button>

        <button
          onClick={() => navigate(`/pdf/${ev._id}`)}
          className="btn-primary w-full"
        >
          Exportar PDF
        </button>
      </div>

    </div>
  );
}