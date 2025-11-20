// MedioDonutScore.jsx
import { Doughnut } from "react-chartjs-2";

export default function MedioDonutScore({ score }) {

  // Escala de colores
  const colores = {
    Bajo: "#7F1D1D",
    Básico: "#DC2626",
    Intermedio: "#F59E0B",
    Avanzado: "#0284C7",
  };

  let nivel = "Bajo";
  if (score >= 80) nivel = "Avanzado";
  else if (score >= 60) nivel = "Intermedio";
  else if (score >= 30) nivel = "Básico";

  const color = colores[nivel];

  const data = {
    labels: ["Puntaje"],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, "transparent"],
        borderWidth: 0,
        hoverBackgroundColor: [color, "transparent"],
        cutout: "70%",
      },
    ],
  };

  const options = {
    rotation: -90,          // inicia arriba
    circumference: 180,     // media dona
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="relative w-64 mx-auto">
      <Doughnut data={data} options={options} />

      <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
        <p className="text-3xl font-bold">{score.toFixed(0)}</p>
        <p className="text-sm text-gray-600">{nivel}</p>
      </div>
    </div>
  );
}