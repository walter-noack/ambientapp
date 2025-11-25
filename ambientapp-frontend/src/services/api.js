import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// 🔥 genera cliente con token si existe
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ======================================================
// 📌 EVALUACIONES
// ======================================================

export const getEvaluaciones = () =>
  axios
    .get(`${API_URL}/evaluaciones`, { headers: authHeaders() })
    .then((res) => res.data);

export const getEvaluacionById = (id) =>
  axios
    .get(`${API_URL}/evaluaciones/${id}`, { headers: authHeaders() })
    .then((res) => res.data);

export const saveEvaluacion = (data) =>
  axios
    .post(`${API_URL}/evaluaciones`, data, { headers: authHeaders() })
    .then((res) => res.data);

export const updateEvaluacion = (id, data) =>
  axios
    .put(`${API_URL}/evaluaciones/${id}`, data, { headers: authHeaders() })
    .then((res) => res.data);

export const deleteEvaluacion = (id) =>
  axios
    .delete(`${API_URL}/evaluaciones/${id}`, { headers: authHeaders() })
    .then((res) => res.data);


// ======================================================
// 📦 LEY REP — Registro de residuos
// ======================================================

// Crear registro REP
export const saveResiduosRep = (data) =>
  axios
    .post(`${API_URL}/rep`, data, { headers: authHeaders() })
    .then((res) => res.data);

// Obtener todos los REP de una empresa
export const getResiduosRep = (empresaId) =>
  axios
    .get(`${API_URL}/rep/empresa/${empresaId}`, { headers: authHeaders() })
    .then((res) => res.data);

// Obtener registros REP por producto prioritario
export const getResiduosRepByProducto = (empresaId, producto) =>
  axios
    .get(`${API_URL}/rep/empresa/${empresaId}/producto/${producto}`, {
      headers: authHeaders(),
    })
    .then((res) => res.data);

// 🛠 CORREGIDO: eliminar REGISTROS REP de una empresa
export const deleteResiduosRep = (empresaId) =>
  axios
    .delete(`${API_URL}/evaluaciones/rep/${empresaId}`, {
      headers: authHeaders(),
    })
    .then((res) => res.data);