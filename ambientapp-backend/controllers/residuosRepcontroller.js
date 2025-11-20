// controllers/residuosRepcontroller.js
const ResiduosRep = require("../models/residuosRep.model");

exports.crearResiduoRep = async (req, res) => {
  try {
    console.log("🟦 RECIBIDO POR BACKEND REP:", req.body);
    console.log("🟩 USER DESDE TOKEN:", req.user);

    const {
      empresaId,
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
      porcentajeValorizacion,
    } = req.body;

    // --- Determinar si el usuario es AdminSupremo ---
    const esAdmin = req.user?.role === "AdminSupremo";

    // --- Validación de empresaId ---
    // Si NO es admin → empresaId es obligatorio
    if (!esAdmin && !empresaId) {
      return res.status(400).json({
        message: "empresaId es obligatorio para usuarios no administradores",
      });
    }

    // AdminSupremo puede guardar registros sin empresaId
    const empresaFinal = esAdmin ? "ADMIN_GLOBAL" : empresaId;

    // --- Validación de campos comunes ---
    if (!producto || !anio) {
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios (producto o año)" });
    }

    if (cantidadGenerada <= 0) {
      return res.status(400).json({
        message: "La cantidad generada debe ser mayor a 0",
      });
    }

    if (cantidadValorizada > cantidadGenerada) {
      return res.status(400).json({
        message: "La cantidad valorizada no puede superar la generada",
      });
    }

    // --- Subcategoría opcional ---
    const subcategoriaFinal = subcategoria?.trim() || "No especificada";

    // --- % valorización si no se envió ---
    const porcentajeCalc =
      porcentajeValorizacion ??
      (cantidadValorizada / cantidadGenerada) * 100;

    // 🟢 Crear registro final
    const nuevoRegistro = await ResiduosRep.create({
      empresaId: empresaFinal,
      producto,
      subcategoria: subcategoriaFinal,
      anio,
      cantidadGenerada,
      cantidadValorizada,
      porcentajeValorizacion: porcentajeCalc,
    });

    return res.status(201).json({
      success: true,
      data: nuevoRegistro,
    });
  } catch (error) {
    console.error("❌ Error al crear RESIDUO REP:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

// ------------------------------------------------------------
// GET /rep/empresa/:empresaId
// ------------------------------------------------------------
exports.getResiduosRepByEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;

    if (!empresaId) {
      return res.status(400).json({ message: "empresaId es requerido" });
    }

    const registros = await ResiduosRep.find({ empresaId }).sort({
      anio: 1,
      producto: 1,
    });

    return res.status(200).json({
      success: true,
      count: registros.length,
      data: registros,
    });
  } catch (error) {
    console.error("❌ Error obteniendo residuos REP:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};