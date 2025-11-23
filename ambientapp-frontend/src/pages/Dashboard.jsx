import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvaluaciones, getResiduosRep } from "../services/api";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import NivelBadge from "../components/nivelBadge";


export default function Dashboard() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    total: 0,
    nivelPromedio: 0,
    empresasConRep: 0,
    ultimaFecha: null,
    promCarbono: 0,
    promAgua: 0,
    promResiduos: 0,
  });

  // =========================================================
  //   CARGA DE LOS DATOS
  // =========================================================
  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluaciones();

        // Ordenar por fecha descendente
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Tomar solo las últimas 10
        const ultimas10 = ordenadas.slice(0, 10);

        setEvaluaciones(ultimas10);

        const total = data.length;

        const nivelPromedio =
          total > 0
            ? data.reduce((acc, e) => acc + (e.finalScore || 0), 0) / total
            : 0;

        // Empresas con REP
        let repCount = 0;
        for (const ev of data) {
          const repData = await getResiduosRep(ev.empresaId);
          if (repData.data && repData.data.length > 0) repCount++;
        }
        const empresasConRep = total > 0 ? Math.round((repCount / total) * 100) : 0;

        // Última fecha
        const fechas = data
          .map((ev) => new Date(ev.createdAt))
          .sort((a, b) => b - a);
        const ultimaFecha = fechas[0]?.toLocaleDateString("es-CL") || "-";

        // Promedios por dimensión
        const promCarbono =
          total > 0
            ? data.reduce((acc, e) => acc + (e.scores?.carbonScore || 0), 0) / total
            : 0;

        // Promedios Agua
        const promAgua =
          total > 0
            ? data.reduce((acc, e) => acc + (e.scores?.waterScore || 0), 0) / total
            : 0;


        const promResiduos =
          total > 0
            ? data.reduce((acc, e) => acc + (e.scores?.wasteScore || 0), 0) / total
            : 0;

        // ---- KPI: Intensidad Hídrica Promedio ----
        let intensidades = [];
        let tiposIntensidad = [];

        data.forEach(ev => {
          const tipo = ev.waterData?.intensidadTipo;
          const valor = Number(ev.waterData?.intensidadValor);

          if (tipo && valor > 0) {
            intensidades.push(valor);
            tiposIntensidad.push(tipo);
          }
        });

        const promIntensidad =
          intensidades.length > 0
            ? intensidades.reduce((a, b) => a + b, 0) / intensidades.length
            : 0;

        // Tipo más frecuente
        const tipoFrecuente =
          tiposIntensidad.length > 0
            ? tiposIntensidad.sort((a, b) =>
              tiposIntensidad.filter(v => v === a).length -
              tiposIntensidad.filter(v => v === b).length
            ).pop()
            : "—";

        setKpis({
          total,
          nivelPromedio,
          empresasConRep,
          ultimaFecha,
          promCarbono,
          promAgua,
          promIntensidad,
          tipoIntensidad: tipoFrecuente,
          promResiduos,
        });
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =========================================================
  //   GRAFICO RADAR (Estabilizado)
  // =========================================================
  useEffect(() => {
    if (loading) return;

    // Espera DOM completamente listo
    setTimeout(() => {
      const canvasRadar = document.getElementById("radarDashboard");
      if (!canvasRadar) return;

      // Evita múltiples instancias si React re-renderiza
      if (canvasRadar._chartInstance) {
        canvasRadar._chartInstance.destroy();
      }

      const chart = new Chart(canvasRadar, {
        type: "radar",
        data: {
          labels: ["Carbono", "Agua", "Residuos"],
          datasets: [
            {
              label: "Promedio global",
              data: [
                kpis.promCarbono,
                kpis.promAgua,
                kpis.promResiduos,
              ],
              backgroundColor: "rgba(34,197,94,0.25)",
              borderColor: "#16a34a",
              borderWidth: 2,
              pointBackgroundColor: "#16a34a",
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              color: "#000000",
              font: {
                size: 13,
                weight: "bold",
              },
              formatter: (val) => val.toFixed(1),
            },
            legend: { display: false },
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { stepSize: 20 },
            },
          },
        },
      });

      canvasRadar._chartInstance = chart;
    }, 120); // 120ms → más estable

  }, [loading, kpis]);

  // =========================================================
  //   ESTADO DE CARGA
  // =========================================================
  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-gray-600">
        Cargando dashboard...
      </div>
    );
  }

  // =========================================================
  //   RENDER PRINCIPAL
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Ambiental</h1>
        <p className="text-slate-600 text-sm mt-1">
          Resumen general de diagnósticos ambientales registrados en la plataforma.
        </p>
      </div>

      {/* KPIs PRINCIPALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">Total Diagnósticos realizados</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.total}</p>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">Nivel promedio</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {kpis.nivelPromedio.toFixed(1)} / 100
          </p>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">% Empresas con REP</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {kpis.empresasConRep}%
          </p>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">Fecha Último Diagnóstico</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            {kpis.ultimaFecha}
          </p>
        </div>

      </div>

      {/* MINI-REPORTES + RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

        {/* TARJETAS DE REPORTES */}
        <div className="space-y-4">

          <Link
            to="/evaluaciones?filtro=carbono"
            className="block p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-sm font-semibold text-slate-900">Desempeño en Carbono</h3>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {kpis.promCarbono.toFixed(1)} / 100
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {kpis.promCarbono >= 60
                ? "Buen control de emisiones."
                : "Hay oportunidades de reducción de emisiones."}
            </p>
          </Link>

          <Link
            to="/evaluaciones?filtro=agua"
            className="block p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-sm font-semibold text-slate-900">Desempeño en Agua</h3>
            <p className="text-3xl font-bold mt-1 text-blue-600">
              {kpis.promAgua.toFixed(1)} / 100
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {kpis.promAgua >= 60
                ? "Consumo hídrico adecuado."
                : "Consumo alto: revisar eficiencia hídrica."}
            </p>
          </Link>



          <Link
            to="/evaluaciones?filtro=intensidad"
            className="block p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Intensidad Hídrica Promedio
            </h3>

            <p className="text-3xl font-bold mt-1 text-cyan-600">
              {kpis.promIntensidad.toFixed(1)}{" "}
              <span className="text-base text-slate-500">
                {kpis.tipoIntensidad === "Consumo por unidad de producción"
                  ? "L/unidad"
                  : kpis.tipoIntensidad === "Consumo por persona"
                    ? "L/persona·día"
                    : ""}
              </span>
            </p>

            <p className="text-xs text-slate-600 mt-2">
              {kpis.promIntensidad <= 15
                ? "Consumo hídrico eficiente."
                : kpis.promIntensidad <= 30
                  ? "Intensidad moderada."
                  : "Intensidad alta: revisar procesos."}
            </p>
          </Link>

          <Link
            to="/evaluaciones?filtro=residuos"
            className="block p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-sm font-semibold text-slate-900">Desempeño en Residuos</h3>
            <p className="text-3xl font-bold mt-1 text-purple-600">
              {kpis.promResiduos.toFixed(1)} / 100
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {kpis.promResiduos >= 60
                ? "Buena valorización."
                : "Baja valorización: revisar gestión."}
            </p>
          </Link>

        </div>

        {/* RADAR FINAL */}
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Promedio general del perfil ambiental
          </h3>

          <div className="w-full flex justify-center">
            <div className="max-w-[350px] w-full h-[350px]">
              <canvas id="radarDashboard"></canvas>
            </div>
          </div>
        </div>

      </div>

      {/* BOTÓN NUEVA EVALUACIÓN */}
      <div className="flex justify-end mt-4">
        <Link to="/evaluaciones/nueva" className="btn-primary px-4 py-2 rounded-lg">
          + Nuevo Diagnóstico
        </Link>
      </div>

      {/* TABLA EVALUACIONES */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-slate-800">
          Últimos 10 Diagnósticos
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Empresa</th>
                <th>Período</th>
                <th>Puntaje</th>
                <th>Nivel</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {evaluaciones.map((ev) => (
                <tr key={ev._id} className="border-b hover:bg-slate-50 transition">
                  <td className="py-2 font-medium text-slate-700">{ev.companyName}</td>
                  <td>{ev.period}</td>
                  <td>{ev.finalScore}</td>
                  <td><NivelBadge nivel={ev.nivel} /></td>
                  <td>
                    <Link
                      to={`/detalle/${ev._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}