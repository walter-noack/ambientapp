// src/pages/ListaEvaluaciones.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEvaluaciones, deleteEvaluacion } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Tooltip from "../components/Tooltip";

import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

export default function ListaEvaluaciones() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ← rol del usuario
  const rol = user?.role || "Consultor";

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtros, setFiltros] = useState({
    empresa: "",
    periodo: "",
    nivel: "",
  });

  // Ordenamiento
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    cargar();
  }, []);

  // ======================================================
  // 🔄 CARGAR LISTA
  // ======================================================
  const cargar = async () => {
    try {
      const data = await getEvaluaciones();

      // Si el usuario es EmpresaConsultora → filtrar por empresaId
      let visibles = [...data];

      if (rol === "EmpresaConsultora") {
        visibles = visibles.filter(
          (ev) => ev.empresaId === user?.empresaId
        );
      }

      setEvaluaciones(visibles);
      setFiltered(visibles);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando evaluaciones", error);
      setLoading(false);
    }
  };

  // ======================================================
  // 🔍 FILTRAR
  // ======================================================
  const handleFiltro = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);

    const filtrado = evaluaciones.filter((ev) => {
      return (
        (nuevosFiltros.empresa === "" ||
          ev.companyName
            .toLowerCase()
            .includes(nuevosFiltros.empresa.toLowerCase())) &&
        (nuevosFiltros.periodo === "" ||
          ev.period.toLowerCase().includes(nuevosFiltros.periodo.toLowerCase())) &&
        (nuevosFiltros.nivel === "" || ev.nivel === nuevosFiltros.nivel)
      );
    });

    setFiltered(filtrado);
  };

  // ======================================================
  // 🔽 ORDENAR POR COLUMNA
  // ======================================================
  const ordenarPor = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sorted = [...filtered].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFiltered(sorted);
  };

  const iconSort = (key) => {
    if (sortConfig.key !== key) return "⬍";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // ======================================================
  // 🗑 ELIMINAR
  // ======================================================
  const handleDelete = async (id) => {
    const seguro = confirm("¿Eliminar esta evaluación?");
    if (!seguro) return;

    try {
      await deleteEvaluacion(id);
      alert("Evaluación eliminada");
      cargar();
    } catch (error) {
      console.error("Error eliminando evaluación", error);
      alert("❌ Error eliminando evaluación");
    }
  };

  // ======================================================
  // TAG DE NIVEL
  // ======================================================
  const badgeNivel = (nivel) => {
    const estilos = {
      Avanzado: "bg-sky-100 text-sky-700 border border-sky-300",
      Intermedio: "bg-amber-100 text-amber-700 border border-amber-300",
      Básico: "bg-rose-100 text-rose-700 border border-rose-300",
      Bajo: "bg-red-100 text-red-700 border border-red-300",
    };

    return (
      <span
        className={
          "px-3 py-1 rounded-full text-xs font-semibold " +
          (estilos[nivel] || "bg-slate-100 text-slate-700")
        }
      >
        {nivel}
      </span>
    );
  };

  // ======================================================
  // ⏳ LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-green-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // 🧾 UI PRINCIPAL
  // ======================================================
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Evaluaciones Registradas
        </h1>
        <p className="text-gray-600">Gestión de evaluaciones ambientales</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filtrar por empresa..."
          value={filtros.empresa}
          onChange={(e) => handleFiltro("empresa", e.target.value)}
          className="input"
        />

        <input
          type="text"
          placeholder="Filtrar por periodo..."
          value={filtros.periodo}
          onChange={(e) => handleFiltro("periodo", e.target.value)}
          className="input"
        />

        <select
          value={filtros.nivel}
          onChange={(e) => handleFiltro("nivel", e.target.value)}
          className="input"
        >
          <option value="">Todos los niveles</option>
          <option value="Avanzado">Avanzado</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Básico">Básico</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl shadow-sm bg-white">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-slate-100 text-left text-sm font-semibold text-slate-700">
              <th className="px-4 py-3 cursor-pointer" onClick={() => ordenarPor("companyName")}>
                Empresa {iconSort("companyName")}
              </th>

              <th className="px-4 py-3 cursor-pointer" onClick={() => ordenarPor("period")}>
                Periodo {iconSort("period")}
              </th>

              <th className="px-4 py-3 cursor-pointer" onClick={() => ordenarPor("finalScore")}>
                Puntaje {iconSort("finalScore")}
              </th>

              <th className="px-4 py-3">Nivel</th>

              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No hay evaluaciones que coincidan con los filtros.
                </td>
              </tr>
            )}

            {filtered.map((ev) => (
              <tr key={ev._id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3">{ev.companyName}</td>
                <td className="px-4 py-3">{ev.period}</td>
                <td className="px-4 py-3 font-bold">{ev.finalScore}</td>
                <td className="px-4 py-3">{badgeNivel(ev.nivel)}</td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-4">

                    {/* 👁 Ver Detalle */}
                    <Tooltip label="Ver Detalle">
                      <button
                        onClick={() => navigate(`/evaluaciones/${ev._id}`)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <EyeIcon className="h-5 w-5 text-gray-700" />
                      </button>
                    </Tooltip>

                    {/* ✏️ Editar */}
                    {(rol === "AdminSupremo" || rol === "EmpresaConsultora") && (
                      <Tooltip label="Editar Evaluación">
                        <button
                          onClick={() => navigate(`/evaluaciones/editar/${ev._id}`)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                          <PencilSquareIcon className="h-5 w-5 text-blue-600" />
                        </button>
                      </Tooltip>
                    )}

                    {/* ⬇ Exportar PDF */}
                    <Tooltip label="Exportar PDF">
                      <button
                        onClick={() => navigate(`/pdf/${ev._id}`)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 text-emerald-600" />
                      </button>
                    </Tooltip>

                    {/* 🗑 Eliminar */}
                    {rol === "AdminSupremo" && (
                      <Tooltip label="Eliminar Evaluación">
                        <button
                          onClick={() => handleDelete(ev._id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </Tooltip>
                    )}

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}