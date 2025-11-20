// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Si NO hay usuario → no mostrar navbar (así la página login queda limpia)
  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO / NOMBRE */}
        <div
          className="text-xl font-bold text-green-700 cursor-pointer"
          onClick={() => navigate("/")}
        >
          AmbientAPP
        </div>

        {/* MENÚ PRINCIPAL */}
        <div className="flex items-center gap-6">

          <Link
            to="/"
            className="text-sm font-semibold text-gray-700 hover:text-green-600"
          >
            Dashboard
          </Link>

          <Link
            to="/evaluaciones"
            className="text-sm font-semibold text-gray-700 hover:text-green-600"
          >
            Evaluaciones
          </Link>

          {/* Solo AdminSupremo o EmpresaConsultora pueden crear */}
          {(user.role === "AdminSupremo" || user.role === "EmpresaConsultora") && (
            <Link
              to="/nueva"
              className="text-sm font-semibold text-gray-700 hover:text-green-600"
            >
              Nueva Evaluación
            </Link>
          )}

          <Link
            to="/acerca"
            className="text-sm font-semibold text-gray-700 hover:text-green-600"
          >
            Acerca de
          </Link>
        </div>

        {/* PERFIL / CERRAR SESIÓN */}
        <div className="flex items-center gap-4">

          {/* Nombre del usuario */}
          <div className="text-sm text-gray-600 font-medium">
            👤 {user.nombre}{" "}
            <span className="text-xs text-gray-400">({user.role})</span>
          </div>

          {/* Botón logout */}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-sm px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}