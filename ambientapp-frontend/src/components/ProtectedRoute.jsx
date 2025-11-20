import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Cargando...</div>;

  // NO LOGEADO → FUERA
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // SI SE PASAN ROLES → RESTRINGIR ACCESO
  if (roles && !roles.includes(user.role)) {
    return <div className="text-center text-red-600 p-8 text-xl">
      🚫 No tienes permiso para acceder a esta página.
    </div>;
  }

  return children;
}