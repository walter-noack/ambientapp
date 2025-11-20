const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  sector: { type: String },
  period: { type: String },

  carbonData: { type: Object, default: {} },
  waterData: { type: Object, default: {} },
  wasteData: { type: Object, default: {} },

  scores: {
    carbonScore: Number,
    waterScore: Number,
    wasteScore: Number,
  },

  finalScore: Number,
  nivel: String,

  recommendations: [String],

  // 🟢 NUEVOS CAMPOS (para roles y permisos)
  empresaId: {
    type: String,
    default: null,
  },

  usuarioId: {
    type: String,
    default: null,
  },

  usuarioNombre: {
    type: String,
    default: "",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Evaluation", EvaluationSchema);