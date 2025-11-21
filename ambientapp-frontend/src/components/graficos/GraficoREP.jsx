import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

export default function GraficoRep({ residuosRep, totalResiduosKg }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !residuosRep || residuosRep.length === 0) return;

    const años = [...new Set(residuosRep.map((r) => r.anio))].sort();
    const productos = [...new Set(residuosRep.map((r) => r.producto))];

    const ultimoAnio = años[años.length - 1];

    const porProductoUltimo = productos.map((prod) => {
      const registros = residuosRep.filter(
        (r) => r.anio === ultimoAnio && r.producto === prod
      );
      return registros.reduce((sum, r) => sum + (r.cantidadGenerada || 0), 0);
    });

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Total residuos", ...productos],
        datasets: [
          {
            label: `Generación de residuos ${ultimoAnio} (kg)`,
            data: [totalResiduosKg, ...porProductoUltimo],
            backgroundColor: ["#0f766e", ...productos.map(() => "#22c55e")],
            borderRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom" },
          datalabels: { display: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  };

  useEffect(() => {
    if (!residuosRep || residuosRep.length === 0) return;

    // 🔥 doble RAF + fallback setTimeout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        renderChart();
      });
    });

    setTimeout(() => {
      renderChart();
    }, 150);

    // 🔥 redibujo en resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          renderChart();
        });
      });
    });

    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    return () => {
      if (chartRef.current) chartRef.current.destroy();
      resizeObserver.disconnect();
    };
  }, [residuosRep]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[260px] relative flex items-center justify-center"
    >
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}