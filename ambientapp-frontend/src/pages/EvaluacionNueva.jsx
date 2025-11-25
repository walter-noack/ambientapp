// 📌 EvaluacionNueva.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { saveEvaluacion, saveResiduosRep } from "../services/api";
import { useAuth } from "../context/AuthContext";

import PasoContainer from "../components/form/PasoContainer";
import PasoTitulo from "../components/form/PasoTitulo";
import Input from "../components/form/Input";
import Select from "../components/form/Select";

import { calcularEvaluacionReal } from "../utils/calculosHuella";
import { generarRecomendaciones } from "../utils/recomendaciones";

// 🔵 Convierte un período en un año usable por REP
function periodoToYear(periodo = "") {
  if (!periodo) return "";

  // Año completo (Ej: "Año 2025", "2025")
  const matchYear = periodo.match(/20\d{2}/);
  if (matchYear) return Number(matchYear[0]);

  // Semestres comunes (Ej: "1er Semestre 2024", "2do Semestre 2023")
  const matchSem = periodo.match(/(1er|2do)\s+Semestre\s+(20\d{2})/i);
  if (matchSem) return Number(matchSem[2]);

  return "";
}


export default function EvaluacionNueva() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);

  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    sector: "",
    otroSector: "",
    period: "",
    carbonData: {
      electricidad: "",
      gas: "",
      diesel: "",
      bencina: "",
    },
    waterData: {
      consumoMensual: 0,
      fuentePrincipal: "",
      intensidadTipo: "",
      intensidadValor: "",  // se calculará automáticamente
      trabajadores: "",     // NUEVO
      produccion: "",       // NUEVO
    },


    wasteData: {
      residuosTotales: "",
      residuosReciclados: "",
      rep: [], // Lista múltiple de productos REP
    },
  });

  const [nuevoRep, setNuevoRep] = useState({
    producto: "",
    subcategoria: "",
    anio: "",
    cantidadGenerada: "",
    cantidadValorizada: "",
    porcentajeValorizacion: 0,
  });

  // ---------------- VALIDACIÓN EN VIVO -------------------------
  const validarCampo = (campo, valor, contexto = {}) => {
    let mensaje = "";

    // ------ Generales ------
    if (campo === "companyName" && !valor.trim()) mensaje = "Ingrese nombre";

    if (campo === "sector" && !valor) mensaje = "Seleccione sector";

    if (campo === "otroSector" && formData.sector === "Otro" && !valor.trim())
      mensaje = "Indique rubro";

    if (campo === "period") {
      const periodRegex = /(20\d{2})|(1er Semestre 20\d{2})|(2do Semestre 20\d{2})/;

      if (!periodRegex.test(formData.period)) {
        err.period = "Formato válido: '1er Semestre 2024', 'Año 2025', '2024'";
      }
    }

    // ------ Carbono ------
    if (
      ["electricidad", "gas", "diesel", "bencina"].includes(campo) &&
      (valor === "" || Number(valor) <= 0)
    ) {
      mensaje = "Debe ser mayor a 0";
    }

    // ------ Agua ------
    // --- Intensidad hídrica: selección ---
    if (campo === "tipoIntensidad" && !valor) {
      mensaje = "Seleccione un método de cálculo";
    }

    // --- Intensidad por unidad de producción ---
    if (campo === "produccionAnual") {
      if (valor === "" || Number(valor) <= 0)
        mensaje = "Debe ser mayor a 0";
    }

    if (campo === "unidadProduccion" &&
      formData.waterData.tipoIntensidad === "Por unidad de producción" &&
      !valor.trim()) {
      mensaje = "Indique la unidad (kg, unidades, litros...)";
    }

    // --- Intensidad por persona al día ---
    if (campo === "trabajadores") {
      if (valor === "" || Number(valor) <= 0)
        mensaje = "Debe ser mayor a 0";
    }

    if (campo === "diasOperativos") {
      if (valor === "" || Number(valor) <= 0)
        mensaje = "Debe ser mayor a 0";
      if (Number(valor) > 31)
        mensaje = "No puede ser mayor a 31 días";
    }

    // ------ Residuos ------
    if (campo === "residuosTotales") {
      if (valor === "" || Number(valor) <= 0)
        mensaje = "Debe ser mayor a 0";
    }

    if (campo === "residuosReciclados") {
      if (Number(valor) < 0) mensaje = "Dato inválido";

      const total = Number(formData.wasteData.residuosTotales);
      if (total && Number(valor) > total)
        mensaje = "No puede superar lo generado";
    }

    // ------ REP (campos temporales) ------
    if (campo === "rep_producto_temp" && !valor)
      mensaje = "Seleccione producto prioritario";

    if (campo === "rep_subcategoria_temp" && !valor.trim())
      mensaje = "Ingrese subcategoría";

    if (campo === "rep_anio_temp") {
      if (!valor) {
        mensaje = "Ingrese año";
      } else {
        const anioNum = Number(valor);
        const añoActual = new Date().getFullYear();
        if (anioNum < 2017 || anioNum > añoActual)
          mensaje = `Año inválido. Debe estar entre 2017 y ${añoActual}`;
      }
    }

    if (campo === "rep_cantidadGenerada_temp") {
      if (!valor || Number(valor) <= 0) {
        mensaje = "Debe ser mayor a 0";
      } else if (Number(valor) > 10_000_000) {
        mensaje = "Valor excesivo (máx: 1.000.000.000 kg)";
      }
    }

    if (campo === "rep_cantidadValorizada_temp") {
      const cantidadGenerada = Number(contexto.cantidadGenerada || 0);
      const cantidadValorizada = Number(valor || 0);

      if (cantidadValorizada < 0) mensaje = "Dato inválido";
      else if (cantidadGenerada && cantidadValorizada > cantidadGenerada)
        mensaje = "No puede superar lo generado";
    }

    // ------ Límites máximos en vivo ------
    const limites = {
      electricidad: 200_000_000,
      gas: 10_000_000,
      diesel: 10_000_000,
      bencina: 10_000_000,
      consumoMensual: 1_000_000_000,
      residuosTotales: 1_000_000_000,
      rep_cantidadGenerada_temp: 1_000_000_000,
    };

    if (campo in limites) {
      if (Number(valor) > limites[campo]) {
        mensaje = `Valor excesivo. Máximo permitido: ${limites[campo].toLocaleString()}`;
      }
    }
    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
  };

  // ------------------ HANDLE INPUT CON VALIDACIÓN EN VIVO -----------------------
  const handleInput = (e, categoria = null) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // ------------------------------
      // 1. Actualizar normalmente
      // ------------------------------
      let updated = categoria
        ? {
          ...prev,
          [categoria]: {
            ...prev[categoria],
            [name]: value,
          },
        }
        : {
          ...prev,
          [name]: value,
        };

      // --------------------------------------------------
      // 2. CÁLCULO AUTOMÁTICO DE INTENSIDAD HÍDRICA
      // --------------------------------------------------
      const agua = updated.waterData;

      // Si cambiamos algo relacionado al agua, recalculamos
      if (
        categoria === "waterData" ||
        name === "consumoMensual" ||
        name === "trabajadores" ||
        name === "produccion"
      ) {
        const consumo = Number(agua.consumoMensual || 0);

        // 🔹 Modo 1: Consumo por persona
        if (agua.intensidadTipo === "Consumo por persona") {
          const trabajadores = Number(agua.trabajadores || 0);

          if (consumo > 0 && trabajadores > 0) {
            updated.waterData.intensidadValor = Number(
              consumo / (trabajadores * 30) // consumo diario por persona
            ).toFixed(2);
          } else {
            updated.waterData.intensidadValor = "";
          }
        }

        // 🔹 Modo 2: Consumo por unidad de producción
        if (agua.intensidadTipo === "Consumo por unidad de producción") {
          const produccion = Number(agua.produccion || 0);

          if (consumo > 0 && produccion > 0) {
            updated.waterData.intensidadValor = Number(
              consumo / produccion
            ).toFixed(2);
          } else {
            updated.waterData.intensidadValor = "";
          }
        }
      }


      // ----------------------------
      // 🔵 AUTO-DETECCIÓN DEL AÑO REP
      // ----------------------------
      if (name === "period") {
        const year = periodoToYear(value);
        updated.repYear = year; // se usa en el input REP
      }

      return updated;
    });

    // Mantiene tu validación original
    validarCampo(name, value);
  };



  // ------------------ AGREGAR PRODUCTO REP ----------------------
  const agregarProductoRep = () => {
    const {
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
    } = nuevoRep;

    // Validación local de los campos REP antes de agregar
    validarCampo("rep_producto_temp", producto);
    validarCampo("rep_subcategoria_temp", subcategoria);
    validarCampo("rep_cantidadGenerada_temp", cantidadGenerada);
    validarCampo("rep_cantidadValorizada_temp", cantidadValorizada, {
      cantidadGenerada,
    });

    const hayErrorLocal = [
      "rep_producto_temp",
      "rep_subcategoria_temp",
      "rep_anio_temp",
      "rep_cantidadGenerada_temp",
      "rep_cantidadValorizada_temp",
    ].some((k) => !!errores[k]);

    if (
      !producto ||
      !subcategoria ||
      !formData.repYear ||
      !cantidadGenerada ||
      hayErrorLocal
    ) {
      alert("Revisa los campos del producto REP antes de agregarlo.");
      return;
    }

    const porcentajeValorizacion =
      cantidadGenerada && cantidadValorizada
        ? (Number(cantidadValorizada) / Number(cantidadGenerada)) * 100
        : 0;

    setFormData((prev) => ({
      ...prev,
      wasteData: {
        ...prev.wasteData,
        rep: [
          ...prev.wasteData.rep,
          {
            producto,
            subcategoria,
            anio: formData.repYear,
            cantidadGenerada: Number(cantidadGenerada),
            cantidadValorizada: Number(cantidadValorizada),
            porcentajeValorizacion,
          },
        ],
      },
    }));

    // Limpiar campos REP temporales
    setNuevoRep({
      producto: "",
      subcategoria: "",
      anio: "",
      cantidadGenerada: "",
      cantidadValorizada: "",
      porcentajeValorizacion: 0,
    });

    // Limpiar errores temporales de REP
    setErrores((prev) => ({
      ...prev,
      rep_producto_temp: "",
      rep_subcategoria_temp: "",
      rep_anio_temp: "",
      rep_cantidadGenerada_temp: "",
      rep_cantidadValorizada_temp: "",
    }));
  };

  const eliminarProductoRep = (index) => {
    setFormData((prev) => ({
      ...prev,
      wasteData: {
        ...prev.wasteData,
        rep: prev.wasteData.rep.filter((_, i) => i !== index),
      },
    }));
  };

  // ---------------- VALIDACIÓN FINAL ANTES DE GUARDAR -------------------------
  const validar = () => {
    const err = {};

    // --- General ---
    if (!formData.companyName.trim()) err.companyName = "Ingrese nombre";
    if (!formData.sector) err.sector = "Seleccione sector";
    if (formData.sector === "Otro" && !formData.otroSector.trim())
      err.otroSector = "Indique rubro";

    const regexPeriodo = /^20\d{2}-(S1|S2)$/;
    if (!regexPeriodo.test(formData.period))
      err.period = "Formato válido: 1er Semestre 2024";

    // --- Carbono (con límites máximos) ---
    const c = formData.carbonData;
    const limitesCarbono = {
      electricidad: 200_000_000, // 20 millones kWh/año
      gas: 10_000_000,          // 1M kg/año
      diesel: 10_000_000,       // 1M L/año
      bencina: 10_000_000,      // 1M L/año
    };

    Object.keys(c).forEach((k) => {
      const valor = Number(c[k]);
      if (!valor || valor <= 0) {
        err[k] = "Debe ser mayor a 0";
      } else if (valor > limitesCarbono[k]) {
        err[k] = `Valor excesivo. Máximo permitido: ${limitesCarbono[k].toLocaleString()}`;
      }
    });

    // --- Agua (con límite máximo) ---
    const w = formData.waterData;
    if (!w.consumoMensual || Number(w.consumoMensual) <= 0)
      err.consumoMensual = "Debe ser mayor a 0";
    else if (Number(w.consumoMensual) > 1_000_000_000)
      err.consumoMensual = "Valor excesivo. Máximo permitido: 1.000.000.000 kg)";

    if (!w.fuentePrincipal) err.fuentePrincipal = "Seleccione fuente";

    if (formData.waterData.tipoIntensidad === "Por unidad de producción") {
      if (!formData.waterData.produccionAnual ||
        Number(formData.waterData.produccionAnual) <= 0) {
        err.produccionAnual = "Debe ser mayor a 0";
      }

      if (!formData.waterData.unidadProduccion.trim()) {
        err.unidadProduccion = "Indique la unidad";
      }
    }

    if (formData.waterData.tipoIntensidad === "Por persona al día") {
      if (!formData.waterData.trabajadores ||
        Number(formData.waterData.trabajadores) <= 0) {
        err.trabajadores = "Debe ser mayor a 0";
      }

      if (!formData.waterData.diasOperativos ||
        Number(formData.waterData.diasOperativos) <= 0) {
        err.diasOperativos = "Debe ser mayor a 0";
      }

      if (Number(formData.waterData.diasOperativos) > 31) {
        err.diasOperativos = "No puede ser mayor a 31 días";
      }
    }

    // --- Residuos generales ---
    const r = formData.wasteData;
    if (!r.residuosTotales || Number(r.residuosTotales) <= 0)
      err.residuosTotales = "Debe ser mayor a 0";
    else if (Number(r.residuosTotales) > 1_000_000)
      err.residuosTotales = "Valor excesivo. Máximo: 1.000.000.000 kg";

    if (r.residuosReciclados === "" || Number(r.residuosReciclados) < 0)
      err.residuosReciclados = "Dato inválido";

    if (
      r.residuosTotales &&
      r.residuosReciclados &&
      Number(r.residuosReciclados) > Number(r.residuosTotales)
    )
      err.residuosReciclados = "No puede superar lo generado";

    // --- REP MÚLTIPLE ---
    const repList = formData.wasteData.rep;
    const añoActual = new Date().getFullYear();

    repList.forEach((rep, index) => {
      if (!rep.producto)
        err[`rep_producto_${index}`] = "Seleccione producto prioritario";

      if (!rep.subcategoria)
        err[`rep_subcategoria_${index}`] = "Ingrese subcategoría";

      if (!rep.anio)
        err[`rep_anio_${index}`] = "Ingrese año";
      else if (rep.anio < 2017 || rep.anio > añoActual)
        err[`rep_anio_${index}`] = `Año inválido. Debe estar entre 2017 y ${añoActual}`;

      if (!rep.cantidadGenerada || rep.cantidadGenerada <= 0)
        err[`rep_cantidadGenerada_${index}`] = "Debe ser mayor a 0";
      else if (rep.cantidadGenerada > 1_000_000_000)
        err[`rep_cantidadGenerada_${index}`] =
          "Valor excesivo. Máximo permitido: 1,000,000,000 kg)";

      if (rep.cantidadValorizada < 0)
        err[`rep_cantidadValorizada_${index}`] = "Dato inválido";
      else if (rep.cantidadValorizada > rep.cantidadGenerada)
        err[`rep_cantidadValorizada_${index}`] =
          "La cantidad valorizada no puede superar la generada";
    });

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  // ---------------- GUARDAR ------------------------------
  const handleGuardar = async () => {
    if (!validar()) {
      alert("Hay errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      const resultados = calcularEvaluacionReal(formData);
      const recomendaciones = generarRecomendaciones(
        resultados.scores,
        resultados.finalScore
      );

      const evaluacionCompleta = {
        companyName: formData.companyName,
        sector:
          formData.sector === "Otro" ? formData.otroSector : formData.sector,
        period: formData.period,

        carbonData: formData.carbonData,
        waterData: formData.waterData,
        wasteData: formData.wasteData,

        emisiones: resultados.emisiones,
        scores: resultados.scores,
        finalScore: resultados.finalScore,
        nivel: resultados.nivel,
        recomendaciones,
        empresaId: user?.empresaId || null,
      };

      // GUARDAR EVALUACIÓN
      await saveEvaluacion(evaluacionCompleta);

      // GUARDAR REP MULTILISTA
      const repList = formData.wasteData.rep;

      for (const rep of repList) {
        await saveResiduosRep({
          empresaId: evaluacionCompleta.empresaId,
          producto: rep.producto,
          subcategoria: rep.subcategoria,
          anio: rep.anio || formData.repYear,
          cantidadGenerada: rep.cantidadGenerada,
          cantidadValorizada: rep.cantidadValorizada,
        });
      }

      alert("Evaluación guardada correctamente");
      navigate("/evaluaciones");
    } catch (err) {
      console.error(err);
      alert("Error guardando evaluación");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ------------------------------
  const irAPaso = (n) => setPaso(n);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Nuevo Diagnóstico Ambiental
        </h1>

        {/* Indicador pasos */}
        <div className="flex justify-between mb-6">
          {["General", "Carbono", "Agua", "Residuos"].map((et, i) => {
            const num = i + 1;
            const activo = paso === num;
            const completado = paso > num;

            return (
              <button
                key={et}
                type="button"
                onClick={() => irAPaso(num)}
                className={`flex-1 mx-1 py-2 rounded-lg text-sm font-semibold
                  ${activo ? "bg-green-600 text-white" : ""}
                  ${completado ? "bg-green-200 text-green-800" : ""}
                  ${!activo && !completado ? "bg-gray-200 text-gray-600" : ""}
                `}
              >
                {num}. {et}
              </button>
            );
          })}
        </div>

        {/* ---------------- PASO 1 ---------------- */}
        <PasoContainer visible={paso === 1}>
          <PasoTitulo titulo="1. Información General" />

          <Input
            label="Nombre de la Empresa"
            name="companyName"
            value={formData.companyName}
            error={errores.companyName}
            onChange={handleInput}
          />

          <Select
            label="Sector Industrial"
            name="sector"
            value={formData.sector}
            onChange={handleInput}
            error={errores.sector}
            options={[
              "Manufactura",
              "Servicios",
              "Retail",
              "Construcción",
              "Tecnología",
              "Alimentos",
              "Agrícola",
              "Transporte",
              "Minería",
              "Otro",
            ]}
          />

          {formData.sector === "Otro" && (
            <Input
              label="Especifique rubro"
              name="otroSector"
              value={formData.otroSector}
              error={errores.otroSector}
              onChange={handleInput}
            />
          )}

          <Input
            label="Período (Ej: 1er Semestre 2024)"
            name="period"
            value={formData.period}
            error={errores.period}
            onChange={handleInput}
          />
        </PasoContainer>

        {/* ---------------- PASO 2 ---------------- */}
        <PasoContainer visible={paso === 2}>
          <PasoTitulo titulo="2. Emisiones de Carbono" />

          <Input
            label="Electricidad (kWh/año)"
            name="electricidad"
            type="number"
            value={formData.carbonData.electricidad}
            error={errores.electricidad}
            onChange={(e) => handleInput(e, "carbonData")}
          />

          <Input
            label="Gas Natural (kg/año)"
            name="gas"
            type="number"
            value={formData.carbonData.gas}
            error={errores.gas}
            onChange={(e) => handleInput(e, "carbonData")}
          />

          <Input
            label="Diésel (litros/año)"
            name="diesel"
            type="number"
            value={formData.carbonData.diesel}
            error={errores.diesel}
            onChange={(e) => handleInput(e, "carbonData")}
          />

          <Input
            label="Bencina (litros/año)"
            name="bencina"
            type="number"
            value={formData.carbonData.bencina}
            error={errores.bencina}
            onChange={(e) => handleInput(e, "carbonData")}
          />
        </PasoContainer>

        {/* ---------------- PASO 3 ---------------- */}
        <PasoContainer visible={paso === 3}>
          <PasoTitulo titulo="3. Consumo de Agua" />

          <Input
            label="Consumo Mensual (litros)"
            name="consumoMensual"
            type="number"
            value={formData.waterData.consumoMensual}
            onChange={(e) => handleInput(e, "waterData")}
          />

          <Select
            label="Fuente Principal"
            name="fuentePrincipal"
            value={formData.waterData.fuentePrincipal}
            onChange={(e) => handleInput(e, "waterData")}
            options={[
              "Red pública",
              "Pozo propio",
              "Río/Lagos",
              "Agua lluvia",
              "Mixta",
            ]}
          />

          <Select
            label="Tipo de Intensidad Hídrica"
            name="intensidadTipo"
            value={formData.waterData.intensidadTipo}
            onChange={(e) => handleInput(e, "waterData")}
            options={[
              "Consumo por unidad de producción",
              "Consumo por persona",
            ]}
          />

          {/* ==== OPCIÓN 1 → Consumo por persona ==== */}
          {formData.waterData.intensidadTipo === "Consumo por persona" && (
            <Input
              label="Número de trabajadores"
              name="trabajadores"
              type="number"
              value={formData.waterData.trabajadores}
              onChange={(e) => handleInput(e, "waterData")}
              placeholder="Ej: 20"
            />
          )}

          {/* ==== OPCIÓN 2 → Consumo por unidad de producción ==== */}
          {formData.waterData.intensidadTipo === "Consumo por unidad de producción" && (
            <Input
              label="Producción mensual (unidades/mes)"
              name="produccion"
              type="number"
              value={formData.waterData.produccion}
              onChange={(e) => handleInput(e, "waterData")}
              placeholder="Ej: 500"
            />
          )}

          {formData.waterData.intensidadValor && (
            <p className="text-sm text-blue-700 font-medium mt-1">
              Intensidad hídrica calculada:{" "}
              <strong>
                {formData.waterData.intensidadValor}{" "}
                {formData.waterData.intensidadTipo === "Consumo por unidad de producción"
                  ? "L/unidad"
                  : "L/persona·día"}
              </strong>
            </p>
          )}


        </PasoContainer>

        {/* ---------------- PASO 4 ---------------- */}
        <PasoContainer visible={paso === 4}>
          <PasoTitulo titulo="4. Gestión de Residuos" />

          <Input
            label="Residuos Totales (kg/año)"
            name="residuosTotales"
            type="number"
            value={formData.wasteData.residuosTotales}
            error={errores.residuosTotales}
            onChange={(e) => handleInput(e, "wasteData")}
          />

          <Input
            label="Residuos Reciclados (kg/año)"
            name="residuosReciclados"
            type="number"
            value={formData.wasteData.residuosReciclados}
            error={errores.residuosReciclados}
            onChange={(e) => handleInput(e, "wasteData")}
          />

          {/* ---------------- MÓDULO LEY REP ---------------- */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              Gestión de Residuos - Ley REP (Productos Prioritarios)
            </h3>

            {/* Formulario para agregar nuevo producto REP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Select
                label="Producto Prioritario"
                name="producto"
                value={nuevoRep.producto}
                error={errores.rep_producto_temp}
                onChange={(e) => {
                  const valor = e.target.value;
                  setNuevoRep((prev) => ({ ...prev, producto: valor }));
                  validarCampo("rep_producto_temp", valor);
                }}
                options={[
                  "Envases y Embalajes",
                  "Neumáticos",
                  "Aceites Lubricantes",
                  "Aparatos Eléctricos/Electrónicos",
                  "Pilas",
                  "Baterías",
                  "Textiles",
                ]}
              />

              <Input
                label="Subcategoría"
                name="subcategoria"
                value={nuevoRep.subcategoria}
                error={errores.rep_subcategoria_temp}
                onChange={(e) => {
                  const valor = e.target.value;
                  setNuevoRep((prev) => ({ ...prev, subcategoria: valor }));
                  validarCampo("rep_subcategoria_temp", valor);
                }}
              />

              <Input
                label="Año (automático según período)"
                name="anio"
                type="number"
                disabled={true}
                value={formData.repYear || ""}
              />

              {/* Cantidad Generada */}
              <Input
                label="Cantidad Generada (kg/año)"
                type="number"
                name="cantidadGenerada"
                value={nuevoRep.cantidadGenerada}
                error={errores.rep_cantidadGenerada_temp}
                onChange={(e) => {
                  const valor = e.target.value;

                  const cantidadGenerada = valor;
                  const cantidadValorizada = nuevoRep.cantidadValorizada;

                  const porcentajeValorizacion =
                    cantidadGenerada && cantidadValorizada
                      ? (Number(cantidadValorizada) /
                        Number(cantidadGenerada)) *
                      100
                      : 0;

                  setNuevoRep((prev) => ({
                    ...prev,
                    cantidadGenerada: valor,
                    porcentajeValorizacion,
                  }));

                  validarCampo("rep_cantidadGenerada_temp", valor);
                  if (cantidadValorizada) {
                    validarCampo(
                      "rep_cantidadValorizada_temp",
                      cantidadValorizada,
                      { cantidadGenerada: valor }
                    );
                  }
                }}
              />

              {/* Cantidad Valorizada */}
              <Input
                label="Cantidad Valorizada (kg/año)"
                type="number"
                name="cantidadValorizada"
                value={nuevoRep.cantidadValorizada}
                error={errores.rep_cantidadValorizada_temp}
                onChange={(e) => {
                  const valor = e.target.value;

                  const cantidadValorizada = valor;
                  const cantidadGenerada = nuevoRep.cantidadGenerada;

                  const porcentajeValorizacion =
                    cantidadGenerada && cantidadValorizada
                      ? (Number(cantidadValorizada) /
                        Number(cantidadGenerada)) *
                      100
                      : 0;

                  setNuevoRep((prev) => ({
                    ...prev,
                    cantidadValorizada: valor,
                    porcentajeValorizacion,
                  }));

                  validarCampo(
                    "rep_cantidadValorizada_temp",
                    valor,
                    { cantidadGenerada }
                  );
                }}
              />
            </div>

            {/* % valorización en vivo */}
            {nuevoRep.porcentajeValorizacion > 0 && (
              <p className="text-sm text-green-600 mt-1">
                {nuevoRep.porcentajeValorizacion.toFixed(1)}% valorizado
              </p>
            )}

            {/* Botón agregar */}
            <button
              type="button"
              onClick={agregarProductoRep}
              className="btn-primary mt-4"
            >
              + Agregar Producto REP
            </button>

            {/* Lista de productos agregados */}
            {formData.wasteData.rep.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-slate-800 mb-2">
                  Productos agregados:
                </h4>

                <ul className="space-y-2">
                  {formData.wasteData.rep.map((item, i) => (
                    <li
                      key={i}
                      className="p-3 bg-white border rounded flex justify-between items-start gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.producto}</p>
                        <p className="text-sm text-slate-600">
                          {item.subcategoria} — {item.anio}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.cantidadGenerada} kg generada |{" "}
                          {item.cantidadValorizada} kg valorizada (
                          {item.porcentajeValorizacion.toFixed(1)}%)
                        </p>

                        {/* Errores específicos por producto */}
                        {errores[`rep_producto_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errores[`rep_producto_${i}`]}
                          </p>
                        )}
                        {errores[`rep_subcategoria_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errores[`rep_subcategoria_${i}`]}
                          </p>
                        )}
                        {errores[`rep_anio_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errores[`rep_anio_${i}`]}
                          </p>
                        )}
                        {errores[`rep_cantidadGenerada_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errores[`rep_cantidadGenerada_${i}`]}
                          </p>
                        )}
                        {errores[`rep_cantidadValorizada_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errores[`rep_cantidadValorizada_${i}`]}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarProductoRep(i)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </PasoContainer>

        {/* BOTONES */}
        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
          <button
            type="button"
            disabled={paso === 1}
            onClick={() => setPaso((p) => p - 1)}
            className="btn-secondary"
          >
            ← Anterior
          </button>

          {paso < 4 ? (
            <button
              type="button"
              onClick={() => setPaso((p) => p + 1)}
              className="btn-primary"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={handleGuardar}
            >
              {loading ? "Guardando..." : "✓ Guardar Evaluación"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}