// src/components/graficos/RadarAmbiental.jsx
import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function RadarAmbiental({ scores, onRender }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !scores || hasRendered.current) return;

    const data = [
      scores.carbonScore ?? 0,
      scores.waterScore ?? 0,
      scores.wasteScore ?? 0,
    ];

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "radar",
      data: {
        labels: ["Carbono", "Agua", "Residuos"],
        datasets: [
          {
            label: "Desempeño",
            data,
            borderColor: "rgba(37, 99, 235, 1)",
            backgroundColor: "rgba(37, 99, 235, 0.25)",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "rgba(37, 99, 235, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          duration: 0, // Sin animación
          onComplete: () => {
            // Llamar onRender solo después de que Chart.js termine
            if (!hasRendered.current && onRender) {
              hasRendered.current = true;
              // Esperar un frame adicional
              requestAnimationFrame(() => {
                setTimeout(() => onRender(), 100);
              });
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { font: { size: 12 } },
            pointLabels: { font: { size: 14 } },
          },
        },
        plugins: { 
          legend: { display: false },
          tooltip: { enabled: false } // Desactivar tooltips
        },
      },
    });

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [scores, onRender]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}