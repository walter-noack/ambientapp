// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "hbdHjs82h3jhsa8*SAHSa7sahKHAS78as81h";
const JWT_EXPIRES = "12h";

// 👑 Solo para crear el primer Admin a mano (luego lo puedes cerrar)
router.post("/register-admin", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const yaExiste = await User.findOne({ email });
    if (yaExiste) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      nombre,
      email,
      passwordHash,
      role: "AdminSupremo",
    });

    await user.save();

    res.json({ message: "Admin creado correctamente", userId: user._id });
  } catch (error) {
    console.error("Error register-admin:", error);
    res.status(500).json({ message: "Error creando admin" });
  }
});
// 🧩 Registro normal (EmpresaConsultora o Consultor)
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, role, empresaId } = req.body;

    if (!nombre || !email || !password || !role) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (!["EmpresaConsultora", "Consultor"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const yaExiste = await User.findOne({ email });
    if (yaExiste) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      nombre,
      email,
      passwordHash,
      role,
      empresaId: empresaId || null,
    });

    await user.save();

    res.json({
      message: "Usuario registrado correctamente",
      userId: user._id
    });

  } catch (error) {
    console.error("Error REGISTER:", error);
    res.status(500).json({ message: "Error creando usuario" });
  }
});

// 📝 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Credenciales inválidas (usuario)" });
    }

    const passwordOK = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOK) {
      return res
        .status(400)
        .json({ message: "Credenciales inválidas (contraseña)" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      empresaId: user.empresaId,
      nombre: user.nombre,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        empresaId: user.empresaId,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en login" });
  }
});

// 👤 Perfil actual (usa el token)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({ message: "Error obteniendo perfil" });
  }
});

module.exports = router;