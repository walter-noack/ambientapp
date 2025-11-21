import { useEffect, useState } from "react";
import { getResiduosRep } from "../../services/api";
import { Bar } from "react-chartjs-2";

export default function GraficoRep({ empresaId }) {
  const [dataRep, setDataRep] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resp = await getResiduosRep(empresaId);
        setDataRep(resp.data || []);
      } catch (err) {
        console.warn("No se cargó REP:", err);
      }
    };

    cargar();
  }, [empresaId]);

  if (!dataRep.length) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="font-semibold mb-2 text-gray-900">
          Gestión de Residuos – Ley REP
        </h3>
        <p className="text-xs text-gray-600">
          No se encontraron registros REP para esta empresa.
        </p>
      </div>
    );
  }

  const labels = dataRep.map((r) => r.producto);
  const values = dataRep.map((r) => r.cantidadGenerada);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cantidad Generada (kg)",
        data: values,
        backgroundColor: "#22c55e",
      },
    ],
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">
        Gestión de Residuos – Ley REP
      </h3>

      <Bar data={chartData} />
    </div>
  );
}