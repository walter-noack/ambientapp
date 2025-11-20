// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["AdminSupremo", "EmpresaConsultora", "Consultor"],
      default: "Consultor",
    },
    empresaId: {
      type: String, // en una versión más avanzada puede ser un ObjectId hacia otra colección
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);