const mongoose = require("mongoose");

const ResiduosRepSchema = new mongoose.Schema(
  {
    empresaId: { type: String, required: true },

    producto: { type: String, required: true },
    subcategoria: { type: String, required: true },
    anio: { type: Number, required: true },

    cantidadGenerada: { type: Number, required: true, min: 0 },
    cantidadValorizada: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return v <= this.cantidadGenerada;
        },
        message: "La cantidad valorizada no puede superar a la generada",
      },
    },

    porcentajeValorizacion: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResiduosRep", ResiduosRepSchema);