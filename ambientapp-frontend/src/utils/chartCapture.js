// src/utils/chartCapture.js
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';

/**
 * Renderiza un gráfico en un canvas virtual y devuelve la imagen en Base64.
 */
async function renderChartToImage(chartConfig, width = 500, height = 500) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Agregar el canvas al DOM temporalmente (oculto)
    canvas.style.position = "absolute";
    canvas.style.left = "-9999px";
    canvas.style.top = "-9999px";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    try {
      const chart = new Chart(ctx, chartConfig);
      
      // Esperar a que el chart se renderice completamente
      setTimeout(() => {
        try {
          chart.update(); // Forzar actualización
          
          setTimeout(() => {
            const base64 = canvas.toDataURL("image/png");
            console.log("🖼️ Base64 generado, longitud:", base64.length);
            
            // Limpiar: destruir chart y remover canvas
            chart.destroy();
            document.body.removeChild(canvas);
            
            resolve(base64);
          }, 100);
        } catch (error) {
          console.error("❌ Error en toDataURL:", error);
          document.body.removeChild(canvas);
          reject(error);
        }
      }, 300);
    } catch (error) {
      console.error("❌ Error creando Chart:", error);
      document.body.removeChild(canvas);
      reject(error);
    }
  });
}

/**
 * Genera imagen del gráfico RADAR (carbono, agua, residuos).
 */
export async function renderRadarToImage(scores) {
  const data = {
    labels: ["Carbono", "Agua", "Residuos"],
    datasets: [
      {
        label: "Puntaje Ambiental",
        data: [
          scores?.carbonScore || 0,
          scores?.waterScore || 0,
          scores?.wasteScore || 0,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(16, 185, 129, 1)",
      },
    ],
  };

  const config = {
    type: "radar",
    data,
    options: {
      animation: false,
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 14 }, // Aumentado de 11 a 14
          },
          pointLabels: {
            font: { 
              size: 18,      // Aumentado de 13 a 18
              weight: "700"  // Más bold (era "600")
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
    plugins: [],
  };

  return renderChartToImage(config, 500, 500);
}

/**
 * Genera imagen del gráfico de BARRAS VERTICALES APILADAS (A1 / A2).
 * CON PORCENTAJES en blanco dentro de las barras.
 */
export async function renderStackedBarToImage(alcance1Kg, alcance2Kg) {
  const totalKg = alcance1Kg + alcance2Kg;
  const pctA1 = totalKg > 0 ? ((alcance1Kg / totalKg) * 100).toFixed(1) : 0;
  const pctA2 = totalKg > 0 ? ((alcance2Kg / totalKg) * 100).toFixed(1) : 0;

  const data = {
    labels: ["Emisiones"],
    datasets: [
      {
        label: "Combustibles (A1)",
        data: [alcance1Kg],
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
      {
        label: "Electricidad (A2)",
        data: [alcance2Kg],
        backgroundColor: "rgba(59, 130, 246, 0.85)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data,
    options: {
      animation: false,
      responsive: false,
      maintainAspectRatio: false,
      indexAxis: "x", // Barras VERTICALES
      scales: {
        x: {
          stacked: true,
          display: false,
        },
        y: {
          stacked: true,
          display: false,
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            font: { size: 12 },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          enabled: false, // Desactivar tooltip ya que mostramos los valores directamente
        },
        datalabels: {
          display: true,
          color: "#ffffff",
          font: {
            size: 20,
            weight: "bold",
          },
          formatter: function (value, context) {
            const datasetIndex = context.datasetIndex;
            if (datasetIndex === 0) {
              return `${pctA1}%`;
            } else {
              return `${pctA2}%`;
            }
          },
          anchor: "center",
          align: "center",
        },
      },
    },
    plugins: [ChartDataLabels], // Activar plugin solo para este gráfico
  };

  return renderChartToImage(config, 400, 500);
}

/**
 * Genera imagen del gráfico DONUT (ejemplo).
 */
export async function renderDonutToImage(data, labels) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: chartData,
    options: {
      animation: false,
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 11 }, padding: 10 },
        },
      },
    },
    plugins: [], // Sin plugins adicionales
  };

  return renderChartToImage(config, 400, 400);
}