// src/components/graficos/GraficoCarbono.jsx

import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { calcularEmisionesCarbono } from "../../utils/calculosHuella";

Chart.register(ChartDataLabels);

export default function GraficoCarbono({ evaluacion }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const emisiones = calcularEmisionesCarbono(evaluacion?.carbonData || {});
    const alcance1Ton = emisiones.alcance1 / 1000;
    const alcance2Ton = emisiones.alcance2 / 1000;
    const totalTon = emisiones.totalTon || 0;

    // destruir gráfico previo
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvas.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Alcance 1", "Alcance 2"],
        datasets: [
          {
            data: [alcance1Ton, alcance2Ton],
            backgroundColor: ["#16a34a", "#3b82f6"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
        },
        animation: false,
      },
      plugins: [{
        id: "centerText",
        afterDraw(chart) {
          const { width } = chart;
          const { height } = chart;
          const ctx = chart.ctx;

          ctx.save();
          ctx.font = "bold 16px Inter, Arial";
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${totalTon.toFixed(2)} tCO₂e`, width / 2, height / 2);
          ctx.restore();
        }
      }]
    });
  };

  useEffect(() => {
    if (!evaluacion) return;

    // 🔥 Doble raf + fallback timeout (máxima estabilidad)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        renderChart();
      });
    });

    setTimeout(() => {
      renderChart();
    }, 150);

    // observar cambios de tamaño
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
  }, [evaluacion]);

  return (
    <div
      ref={wrapperRef}
      className="w-[250px] h-[250px] relative flex items-center justify-center mx-auto"
    >
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}