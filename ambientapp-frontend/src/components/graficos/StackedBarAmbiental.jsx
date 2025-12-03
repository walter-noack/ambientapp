// src/components/graficos/StackedBarAmbiental.jsx
import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function StackedBarAmbiental({ emisiones, onRender }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || !emisiones || hasRendered.current) return;

    const a1 = emisiones.alcance1 || 0;
    const a2 = emisiones.alcance2 || 0;
    const total = a1 + a2;

    const pct1 = total > 0 ? ((a1 / total) * 100).toFixed(1) : 0;
    const pct2 = total > 0 ? ((a2 / total) * 100).toFixed(1) : 0;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: [""],
        datasets: [
          {
            label: `A1 (${pct1}%)`,
            data: [a1],
            backgroundColor: "#16a34a",
          },
          {
            label: `A2 (${pct2}%)`,
            data: [a2],
            backgroundColor: "#3b82f6",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
          onComplete: () => {
            if (!hasRendered.current && onRender) {
              hasRendered.current = true;
              requestAnimationFrame(() => {
                setTimeout(() => onRender(), 100);
              });
            }
          }
        },
        indexAxis: "y",
        scales: {
          x: { 
            stacked: true, 
            grid: { display: false },
            ticks: { font: { size: 12 } }
          },
          y: { 
            stacked: true, 
            ticks: { display: false }, 
            grid: { display: false } 
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 14 } },
          },
          tooltip: { enabled: false }
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [emisiones, onRender]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}