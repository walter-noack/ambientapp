const ResiduosRep = require("../models/residuosRep.model");

exports.crearResiduoRep = async (req, res) => {
  try {
    const {
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
    } = req.body;

    // 🟢 empresaId SIEMPRE desde el token normalizado
    const empresaId = req.user?.empresaId;

    console.log("🟦 RECIBIDO POR BACKEND REP:", {
      empresaId,
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
    });

    if (!empresaId || !producto || !subcategoria || !anio) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (cantidadGenerada == null || cantidadGenerada <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad generada debe ser mayor a 0" });
    }

    if (cantidadValorizada == null || cantidadValorizada < 0) {
      return res
        .status(400)
        .json({ message: "La cantidad valorizada no puede ser negativa" });
    }

    if (cantidadValorizada > cantidadGenerada) {
      return res.status(400).json({
        message: "La cantidad valorizada no puede superar la generada",
      });
    }

    const porcentajeValorizacion =
      (cantidadValorizada / cantidadGenerada) * 100;

    const nuevoRegistro = await ResiduosRep.create({
      empresaId,
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
      porcentajeValorizacion,
    });

    return res.status(201).json({
      success: true,
      data: nuevoRegistro,
    });
  } catch (error) {
    console.error("Error al crear RESIDUO REP:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

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
    console.error("Error obteniendo residuos REP:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};