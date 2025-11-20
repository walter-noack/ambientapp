import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function GraficoEvaluacionPDF({ scores }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Carbono", "Agua", "Residuos"],
        datasets: [
          {
            label: "Puntaje",
            data: [
              scores.carbonScore,
              scores.waterScore,
              scores.wasteScore,
            ],
            backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            suggestedMax: 100,
            ticks: { color: "#333" },
          },
          y: {
            ticks: { color: "#333" },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [scores]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={300}
      style={{ marginTop: 20 }}
    ></canvas>
  );
}