const express = require("express");
const {
  crearResiduoRep,
  getResiduosRepByEmpresa,
} = require("../controllers/residuosRepcontroller");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas REP requieren estar autenticado
router.post("/", authMiddleware, crearResiduoRep);
router.get("/empresa/:empresaId", authMiddleware, getResiduosRepByEmpresa);

module.exports = router;