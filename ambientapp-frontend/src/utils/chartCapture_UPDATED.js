// src/utils/chartCapture.js
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/**
 * Render gráfico en un canvas virtual y devolver PNG Base64
 */
function renderChartToImage(config, width = 500, height = 500) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    const chart = new Chart(ctx, config);

    // Aumentar timeout para asegurar renderizado completo
    setTimeout(() => {
      const img = canvas.toDataURL("image/png");
      chart.destroy();
      resolve(img);
    }, 150);
  });
}

/**
 * Radar Ambiental
 */
export function renderRadarToImage(scores) {
  const config = {
    type: "radar",
    data: {
      labels: ["Carbono", "Agua", "Residuos"],
      datasets: [
        {
          label: "Desempeño",
          data: [
            scores?.carbonScore ?? 0,
            scores?.waterScore ?? 0,
            scores?.wasteScore ?? 0,
          ],
          backgroundColor: "rgba(59, 130, 246, 0.25)",
          borderColor: "rgba(37, 99, 235, 1)",
          pointBackgroundColor: "rgba(37, 99, 235, 1)",
          pointRadius: 5,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, font: { size: 14 } },
          pointLabels: {
            font: { size: 18, weight: "bold" },
            color: "#1e293b",
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  };

  return renderChartToImage(config, 650, 650);
}

/**
 * Donut A1/A2
 */
export function renderDonutToImage(alcance1, alcance2) {
  const total = alcance1 + alcance2;

  const pctA1 = total > 0 ? (alcance1 / total) * 100 : 0;
  const pctA2 = total > 0 ? (alcance2 / total) * 100 : 0;

  const config = {
    type: "doughnut",
    data: {
      labels: [
        `Alcance 1 (${pctA1.toFixed(1)}%)`,
        `Alcance 2 (${pctA2.toFixed(1)}%)`,
      ],
      datasets: [
        {
          data: [alcance1, alcance2],
          backgroundColor: ["#16a34a", "#3b82f6"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      cutout: "58%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  };

  return renderChartToImage(config, 600, 600);
}

/**
 * Barras Apiladas Horizontales (A1/A2)
 */
export function renderStackedBarToImage(alcance1, alcance2) {
  const total = alcance1 + alcance2;
  const pct1 = total > 0 ? ((alcance1 / total) * 100).toFixed(1) : 0;
  const pct2 = total > 0 ? ((alcance2 / total) * 100).toFixed(1) : 0;

  const config = {
    type: "bar",
    data: {
      labels: ["Emisiones"],
      datasets: [
        {
          label: `Alcance 1 (${pct1}%)`,
          data: [alcance1],
          backgroundColor: "#16a34a",
        },
        {
          label: `Alcance 2 (${pct2}%)`,
          data: [alcance2],
          backgroundColor: "#3b82f6",
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      indexAxis: "y",
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { 
            font: { size: 14 },
            callback: function(value) {
              return value.toFixed(2) + ' tCO₂e';
            }
          },
        },
        y: {
          stacked: true,
          ticks: { display: false },
          grid: { display: false },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 16 },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: { enabled: false },
      },
    },
  };

  return renderChartToImage(config, 600, 300);
}