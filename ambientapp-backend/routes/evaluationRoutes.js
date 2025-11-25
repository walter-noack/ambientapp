const express = require("express");
const router = express.Router();
const Evaluation = require("../models/Evaluation");
const ResiduosRep = require("../models/ResiduosRep");
const { authMiddleware } = require("../middleware/authMiddleware");

// ---------------------------------------------------
// 📌 ELIMINAR TODOS LOS REP DE UNA EMPRESA
// ---------------------------------------------------
// ⚠️ IMPORTANTE: ESTA RUTA VA PRIMERO PARA EVITAR COLISIÓN CON "/:id"
router.delete("/rep/:empresaId", async (req, res) => {
  try {
    await ResiduosRep.deleteMany({ empresaId: req.params.empresaId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------
// 📌 OBTENER EVALUACIONES SEGÚN EL ROL
// ---------------------------------------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    let filtro = {};

    if (req.user.role !== "AdminSupremo") {
      filtro.empresaId = req.user.empresaId;
    }

    const evals = await Evaluation.find(filtro).sort({ createdAt: -1 });
    res.json(evals);

  } catch (err) {
    console.error("Error GET /evaluaciones:", err);
    res.status(500).json({ error: "Error obteniendo evaluaciones" });
  }
});

// ---------------------------------------------------
// 📌 OBTENER UNA EVALUACIÓN POR ID
// ---------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const evaluacion = await Evaluation.findById(req.params.id);
    if (!evaluacion) return res.status(404).json({ error: "No encontrada" });

    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
});

// ---------------------------------------------------
// 📌 CREAR UNA NUEVA EVALUACIÓN
// ---------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const nueva = new Evaluation(req.body);
    await nueva.save();
    res.json(nueva);
  } catch (err) {
    res.status(500).json({ error: "Error guardando evaluación" });
  }
});

// ---------------------------------------------------
// 📌 EDITAR UNA EVALUACIÓN
// ---------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const updated = await Evaluation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "No encontrada" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar evaluación" });
  }
});

// ---------------------------------------------------
// 📌 ELIMINAR UNA EVALUACIÓN
// ---------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const eliminada = await Evaluation.findByIdAndDelete(req.params.id);

    if (!eliminada)
      return res.status(404).json({ error: "Evaluación no encontrada" });

    res.json({ message: "Evaluación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando evaluación" });
  }
});

module.exports = router;