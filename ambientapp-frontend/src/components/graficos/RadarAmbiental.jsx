import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function RadarAmbiental({ scores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    // Destruir gráfico previo
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Carbono", "Agua", "Residuos"],
        datasets: [
          {
            label: "Desempeño Ambiental",
            data: [
              scores?.carbonScore ?? 0,
              scores?.waterScore ?? 0,
              scores?.wasteScore ?? 0,
            ],
            backgroundColor: "rgba(59, 130, 246, 0.25)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(37, 99, 235, 1)",
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 👈 Necesario para controlar el alto
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: "rgba(0,0,0,0.12)" },
            angleLines: { color: "rgba(0,0,0,0.12)" },
            pointLabels: {
              font: { size: 14, weight: "600" },
              color: "#374151",
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }, [scores]);

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-xl h-[360px]"> 
        {/* 👆 Ajusta el alto aquí para agrandar el radar */}
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}