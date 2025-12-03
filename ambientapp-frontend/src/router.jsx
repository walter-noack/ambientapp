// router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import EvaluacionNueva from "./pages/EvaluacionNueva";
import ListaEvaluaciones from "./pages/ListaEvaluaciones";
import DetalleEvaluacion from "./pages/DetalleEvaluacion";
import EditarEvaluacion from "./pages/EditarEvaluacion";
import Login from "./pages/Login";
import AcercaDe from "./pages/AcercaDe";
import GenerarPDF from "./pages/GenerarPDF";
import PreviewPDF from "./pages/PreviewPDF";

import ProtectedRoute from "./components/ProtectedRoute";
import ToastManager from "./components/ToastManager";

export default function RouterApp() {
  return (
    <BrowserRouter>

      <Navbar />
      <ToastManager />

      <div className="max-w-5xl mx-auto p-4">
        <Routes>

          {/* 🔓 RUTAS LIBRES */}
          <Route path="/login" element={<Login />} />

          {/* 🔒 RUTAS PROTEGIDAS */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nueva"
            element={
              <ProtectedRoute roles={["AdminSupremo", "Consultor", "EmpresaConsultora"]}>
                <EvaluacionNueva />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluaciones"
            element={
              <ProtectedRoute roles={["AdminSupremo", "EmpresaConsultora"]}>
                <ListaEvaluaciones />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluaciones/:id"
            element={
              <ProtectedRoute roles={["AdminSupremo", "EmpresaConsultora", "Consultor"]}>
                <DetalleEvaluacion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluaciones/editar/:id"
            element={
              <ProtectedRoute roles={["AdminSupremo"]}>
                <EditarEvaluacion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdf/:id"
            element={
              <ProtectedRoute>
                <GenerarPDF />
              </ProtectedRoute>
            }
          />

          <Route
            path="/acerca"
            element={
              <ProtectedRoute>
                <AcercaDe />
              </ProtectedRoute>
            }
          />

          <Route path="/preview-pdf/:id" element={<PreviewPDF />} />

          
        </Routes>
      </div>
    </BrowserRouter>
  );
}