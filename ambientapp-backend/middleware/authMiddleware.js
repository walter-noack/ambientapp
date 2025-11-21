// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "cambia-esto-por-un-secreto-fuerte";

// ID fijo para el superusuario
const EMPRESA_ADMIN_ID = "EMPRESA_ADMIN";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No autorizado: falta token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🌟 Normalizamos empresaId para AdminSupremo
    if (decoded.role === "AdminSupremo" && !decoded.empresaId) {
      decoded.empresaId = EMPRESA_ADMIN_ID;
    }

    req.user = decoded;

    console.log("🟩 USER DESDE TOKEN NORMALIZADO:", req.user);

    next();
  } catch (err) {
    console.error("Error en authMiddleware:", err);
    return res.status(401).json({ message: "Token inválido" });
  }
}

// Middleware para verificar roles
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos suficientes" });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};