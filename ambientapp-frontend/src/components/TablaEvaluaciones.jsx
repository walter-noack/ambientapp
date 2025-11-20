import { Link } from "react-router-dom";

export default function TablaEvaluaciones({ data }) {
  if (!Array.isArray(data)) {
    return <p className="text-sm text-red-600">No se pudieron cargar los datos.</p>;
  }

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No hay evaluaciones aún.</p>;
  }

  return (
    <table className="w-full text-sm bg-white rounded-xl shadow-sm overflow-hidden">
      <thead className="bg-slate-100 text-slate-600">
        <tr>
          <th className="text-left px-4 py-2">Empresa</th>
          <th className="text-left px-4 py-2">Periodo</th>
          <th className="text-left px-4 py-2">Nivel</th>
          <th className="px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((ev) => (
          <tr key={ev._id} className="border-t">
            <td className="px-4 py-2">{ev.companyName}</td>
            <td className="px-4 py-2">{ev.period}</td>
            <td className="px-4 py-2">{ev.nivel}</td>
            <td className="px-4 py-2 text-center">
              <Link to={`/evaluaciones/${ev._id}`} className="text-emerald-600">
                Ver detalle
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}