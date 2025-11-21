import { Radar } from "react-chartjs-2";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarAmbiental({ scores }) {
  const data = {
    labels: ["Carbono", "Agua", "Residuos"],
    datasets: [
      {
        label: "Puntaje",
        data: [
          scores.carbonScore,
          scores.waterScore,
          scores.wasteScore,
        ],
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        borderColor: "#2563EB",
        borderWidth: 2,
        pointBackgroundColor: "#1D4ED8",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        pointLabels: { font: { size: 12 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h2 className="text-base font-semibold text-gray-900 mb-2">
        Perfil Ambiental de la Empresa
      </h2>

      <Radar data={data} options={options} />
    </div>
  );
}