const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const evaluationRoutes = require("./routes/evaluationRoutes");
const authRoutes = require("./routes/authRoutes");
const residuosRepRoutes = require("./routes/residuosRepRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  });

// Rutas
app.use("/auth", authRoutes);
app.use("/evaluaciones", evaluationRoutes);
app.use("/rep", residuosRepRoutes);   // ← NUEVA RUTA REP

app.get("/", (req, res) => {
  res.json({ message: "Backend AmbientAPP funcionando" });
});
app.use("/rep", residuosRepRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});