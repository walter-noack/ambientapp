import { Doughnut } from "react-chartjs-2";

export default function GraficoDonutA1A2({ evaluacion }) {
  const a1 = evaluacion.carbonData?.a1 ?? 0;
  const a2 = evaluacion.carbonData?.a2 ?? 0;

  const data = {
    labels: ["A1 Combustibles", "A2 Electricidad"],
    datasets: [
      {
        data: [a1, a2],
        backgroundColor: ["#16a34a", "#3b82f6"],
      },
    ],
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">
        Huella de Carbono – A1 / A2
      </h3>
      <Doughnut data={data} />
    </div>
  );
}