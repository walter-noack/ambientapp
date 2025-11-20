import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GraficoCircular({ scores }) {
  const data = {
    labels: ["Carbono", "Agua", "Residuos"],
    datasets: [
      {
        data: [
          Number(scores.carbonScore),
          Number(scores.waterScore),
          Number(scores.wasteScore)
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",   // rojo suave
          "rgba(37, 99, 235, 0.7)",   // azul suave
          "rgba(34, 197, 94, 0.7)"    // verde suave
        ],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 4,
        hoverOffset: 10,
        spacing: 4
      }
    ]
  };

  const options = {
    cutout: "65%", // más elegante, estilo dashboard moderno
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: { size: 14, weight: "bold" },
          color: "#374151" // slate-700
        }
      },
      tooltip: {
        backgroundColor: "rgba(30, 41, 59, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        borderColor: "#fff",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const total =
              scores.carbonScore +
              scores.waterScore +
              scores.wasteScore;

            const porcentaje = ((context.raw / total) * 100).toFixed(1);

            return `${context.raw} pts • ${porcentaje}%`;
          }
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-60 md:w-72 lg:w-80">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}