const express = require("express");
const {
  crearResiduoRep,
  getResiduosRepByEmpresa,
} = require("../controllers/residuosRepController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// 🛡 Todas las rutas REP deben requerir token
router.post("/", authMiddleware, crearResiduoRep);
router.get("/empresa/:empresaId", authMiddleware, getResiduosRepByEmpresa);

module.exports = router;