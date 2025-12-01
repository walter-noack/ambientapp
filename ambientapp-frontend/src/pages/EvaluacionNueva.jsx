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

  const matchYear = periodo.match(/20\d{2}/);
  if (matchYear) return Number(matchYear[0]);

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
      consumoMensual: "",
      fuentePrincipal: "",
      intensidadTipo: "",
      intensidadValor: "",
      trabajadores: "",
      produccion: "",
    },
    wasteData: {
      residuosTotales: "",
      residuosReciclados: "",
      rep: [],
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
    let erroresLocal = {};
    let mensaje = "";

    // ------ Generales ------
    if (campo === "companyName" && !valor.trim()) mensaje = "Ingrese nombre";

    if (campo === "sector" && !valor) mensaje = "Seleccione sector";

    if (campo === "otroSector" && formData.sector === "Otro" && !valor.trim())
      mensaje = "Indique rubro";

    // ------ Período ------
    if (campo === "period") {
      const periodRegex =
        /^(Año\s20\d{2}|1er Semestre\s20\d{2}|2do Semestre\s20\d{2}|20\d{2})$/;

      if (!periodRegex.test(valor.trim())) {
        erroresLocal.period =
          "Formato válido: 'Año 2025', '1er Semestre 2025', '2do Semestre 2025' o '2025'";
      }
    }

    if (Object.keys(erroresLocal).length > 0) {
      setErrores((prev) => ({ ...prev, ...erroresLocal }));
      return false;
    }

    // ------ Carbono ------
    if (
      ["electricidad", "gas", "diesel", "bencina"].includes(campo) &&
      (valor === "" || Number(valor) <= 0)
    )
      mensaje = "Debe ser mayor a 0";

    // ------ Agua ------
    if (campo === "trabajadores" && Number(valor) <= 0)
      mensaje = "Debe ser mayor a 0";

    if (campo === "residuosTotales" && Number(valor) <= 0)
      mensaje = "Debe ser mayor a 0";

    if (campo === "residuosReciclados") {
      const total = Number(formData.wasteData.residuosTotales);
      if (Number(valor) < 0) mensaje = "Dato inválido";
      if (total && Number(valor) > total)
        mensaje = "No puede superar lo generado";
    }

    // ------ REP ------
    if (campo === "rep_producto_temp" && !valor)
      mensaje = "Seleccione producto prioritario";

    if (campo === "rep_subcategoria_temp" && !valor.trim())
      mensaje = "Ingrese subcategoría";

    if (campo === "rep_cantidadGenerada_temp" && Number(valor) <= 0)
      mensaje = "Debe ser mayor a 0";

    if (campo === "rep_cantidadValorizada_temp") {
      const cg = Number(contexto.cantidadGenerada);
      const cv = Number(valor);

      if (cv < 0) mensaje = "Dato inválido";
      else if (cg && cv > cg) mensaje = "No puede superar lo generado";
    }

    setErrores((prev) => ({ ...prev, [campo]: mensaje }));
    return !mensaje;
  };

  // ------------------ HANDLE INPUT -----------------------
  const handleInput = (e, categoria = null) => {
    const { name, value } = e.target;

    setFormData((prev) => {
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

      if (name === "period") {
        updated.repYear = periodoToYear(value);
      }

      return updated;
    });

    validarCampo(name, value);
  };

  // ------------------ AGREGAR PRODUCTO REP ----------------------
  const agregarProductoRep = () => {
    const { producto, subcategoria, cantidadGenerada, cantidadValorizada } =
      nuevoRep;

    validarCampo("rep_producto_temp", producto);
    validarCampo("rep_subcategoria_temp", subcategoria);
    validarCampo("rep_cantidadGenerada_temp", cantidadGenerada);
    validarCampo("rep_cantidadValorizada_temp", cantidadValorizada, {
      cantidadGenerada,
    });

    const hayError = [
      "rep_producto_temp",
      "rep_subcategoria_temp",
      "rep_cantidadGenerada_temp",
      "rep_cantidadValorizada_temp",
    ].some((x) => errores[x]);

    if (
      !producto ||
      !subcategoria ||
      !cantidadGenerada ||
      hayError ||
      !formData.repYear
    ) {
      alert("Revisa los campos del producto REP antes de agregarlo.");
      return;
    }

    const porcentajeValorizacion =
      (Number(cantidadValorizada) / Number(cantidadGenerada)) * 100;

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

    setNuevoRep({
      producto: "",
      subcategoria: "",
      anio: "",
      cantidadGenerada: "",
      cantidadValorizada: "",
      porcentajeValorizacion: 0,
    });
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

  // ---------------- VALIDACIÓN FINAL -------------------------
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

    // --- Carbono ---
    const c = formData.carbonData;
    Object.keys(c).forEach((k) => {
      const valor = Number(c[k]);
      if (!valor || valor <= 0) err[k] = "Debe ser mayor a 0";
    });

    // --- Agua ---
    const w = formData.waterData;
    if (!w.consumoMensual || Number(w.consumoMensual) <= 0)
      err.consumoMensual = "Debe ser mayor a 0";

    // --- Residuos generales ---
    const r = formData.wasteData;
    if (!r.residuosTotales || Number(r.residuosTotales) <= 0)
      err.residuosTotales = "Debe ser mayor a 0";

    if (
      Number(r.residuosReciclados) >
      Number(r.residuosTotales)
    )
      err.residuosReciclados = "No puede superar lo generado";

    // --- REP ---
    const repList = r.rep;
    const añoActual = new Date().getFullYear();

    repList.forEach((rep, index) => {
      if (!rep.producto)
        err[`rep_producto_${index}`] = "Seleccione producto prioritario";

      if (!rep.subcategoria)
        err[`rep_subcategoria_${index}`] = "Ingrese subcategoría";

      if (!rep.anio)
        err[`rep_anio_${index}`] = "Ingrese año";
      else if (rep.anio < 2017 || rep.anio > añoActual)
        err[`rep_anio_${index}`] = `Año inválido`;

      const cg = Number(rep.cantidadGenerada);
      if (!cg || cg <= 0)
        err[`rep_cantidadGenerada_${index}`] = "Debe ser mayor a 0";

      const cv = Number(rep.cantidadValorizada);
      if (cv < 0)
        err[`rep_cantidadValorizada_${index}`] = "Dato inválido";
      else if (cv > cg)
        err[`rep_cantidadValorizada_${index}`] =
          "No puede superar lo generado";
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

      await saveEvaluacion(evaluacionCompleta);

      for (const rep of formData.wasteData.rep) {
        await saveResiduosRep({
          empresaId: evaluacionCompleta.empresaId,
          producto: rep.producto,
          subcategoria: rep.subcategoria,
          anio: rep.anio,
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
            error={errores.consumoMensual}
            onChange={(e) => handleInput(e, "waterData")}
          />

          <Select
            label="Fuente Principal"
            name="fuentePrincipal"
            value={formData.waterData.fuentePrincipal}
            error={errores.fuentePrincipal}
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
            error={errores.intensidadTipo}
            onChange={(e) => handleInput(e, "waterData")}
            options={[
              "Consumo por unidad de producción",
              "Consumo por persona",
            ]}
          />

          {formData.waterData.intensidadTipo === "Consumo por persona" && (
            <Input
              label="Número de trabajadores"
              name="trabajadores"
              type="number"
              error={errores.trabajadores}
              value={formData.waterData.trabajadores}
              onChange={(e) => handleInput(e, "waterData")}
            />
          )}

          {formData.waterData.intensidadTipo ===
            "Consumo por unidad de producción" && (
            <Input
              label="Producción mensual"
              name="produccion"
              type="number"
              error={errores.produccion}
              value={formData.waterData.produccion}
              onChange={(e) => handleInput(e, "waterData")}
            />
          )}

          {formData.waterData.intensidadValor && (
            <p className="text-sm text-blue-700 font-medium mt-1">
              Intensidad hídrica calculada:{" "}
              <strong>{formData.waterData.intensidadValor}</strong>
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

          {/* --- MÓDULO REP --- */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              Gestión de Residuos - Ley REP
            </h3>

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
                label="Año"
                name="anio"
                type="number"
                disabled={true}
                value={formData.repYear || ""}
              />

              <Input
                label="Cantidad Generada (kg/año)"
                name="cantidadGenerada"
                type="number"
                value={nuevoRep.cantidadGenerada}
                error={errores.rep_cantidadGenerada_temp}
                onChange={(e) => {
                  const valor = e.target.value;

                  setNuevoRep((prev) => ({
                    ...prev,
                    cantidadGenerada: valor,
                  }));

                  validarCampo("rep_cantidadGenerada_temp", valor);
                }}
              />

              <Input
                label="Cantidad Valorizada (kg/año)"
                name="cantidadValorizada"
                type="number"
                value={nuevoRep.cantidadValorizada}
                error={errores.rep_cantidadValorizada_temp}
                onChange={(e) => {
                  const valor = e.target.value;
                  setNuevoRep((prev) => ({
                    ...prev,
                    cantidadValorizada: valor,
                  }));
                  validarCampo(
                    "rep_cantidadValorizada_temp",
                    valor,
                    { cantidadGenerada: nuevoRep.cantidadGenerada }
                  );
                }}
              />
            </div>

            <button
              type="button"
              onClick={agregarProductoRep}
              className="btn-primary mt-4"
            >
              + Agregar Producto REP
            </button>

            {formData.wasteData.rep.length > 0 && (
              <ul className="mt-6 space-y-2">
                {formData.wasteData.rep.map((item, i) => (
                  <li
                    key={i}
                    className="p-3 bg-white border rounded flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.producto}</p>
                      <p className="text-sm text-slate-600">
                        {item.subcategoria} — {item.anio}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.cantidadGenerada} kg generada |{" "}
                        {item.cantidadValorizada} kg valorizada (
                        {item.porcentajeValorizacion.toFixed(1)}%)
                      </p>

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
              disabled={loading}
              onClick={handleGuardar}
              className="btn-primary"
            >
              {loading ? "Guardando..." : "✓ Guardar Evaluación"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}