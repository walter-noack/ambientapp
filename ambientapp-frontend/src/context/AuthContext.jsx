import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

// --------------------------
// PROVEEDOR
// --------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // datos usuario logeado
  const [token, setToken] = useState(null);   // token JWT
  const [loading, setLoading] = useState(true);

  // Cargar sesión guardada en localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // -----------------------
  // LOGIN
  // -----------------------
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // -----------------------
  // LOGOUT
  // -----------------------
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}