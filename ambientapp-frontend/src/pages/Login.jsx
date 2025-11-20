import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, form);

      login(data.user, data.token);

      navigate("/"); // redirigir al dashboard
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="input-field"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            className="input-field"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn-primary w-full">Ingresar</button>
      </form>
    </div>
  );
}