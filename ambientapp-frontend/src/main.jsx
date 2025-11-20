import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { registerSW } from "virtual:pwa-register";
import { AuthProvider } from "./context/AuthContext";

registerSW();

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);