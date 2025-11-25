// 📌 EditarEvaluacion.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEvaluacionById,
  updateEvaluacion,
  getResiduosRep,
  saveResiduosRep,
  deleteResiduosRep,
} from "../services/api";

import { calcularEvaluacionReal } from "../utils/calculosHuella";
import { generarRecomendaciones } from "../utils/recomendaciones";

import PasoContainer from "../components/form/PasoContainer";
import PasoTitulo from "../components/form/PasoTitulo";
import Input from "../components/form/Input";
import Select from "../components/form/Select";

export default function EditarEvaluacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [errores, setErrores] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    sector: "",
    period: "",
    carbonData: { electricidad: 0, gas: 0, diesel: 0, bencina: 0 },
    waterData: { consumoMensual: 0, fuentePrincipal: "", intensidadTipo: "", intensidadValor: "", },
    wasteData: { residuosTotales: 0, residuosReciclados: 0 },
    empresaId: null,
  });

  // ----------------------------
  // REP MULTILISTA (EDICIÓN)
  // ----------------------------
  const [repList, setRepList] = useState([]);

  const [nuevoRep, setNuevoRep] = useState({
    producto: "",
    subcategoria: "",
    anio: "",
    cantidadGenerada: "",
    cantidadValorizada: "",
    porcentajeValorizacion: 0,
  });

  // ======================================================
  // 🔄 CARGAR EVALUACIÓN + REP
  // ======================================================
  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluacionById(id);
        if (!data) {
          setCargandoDatos(false);
          return;
        }

        setFormData({
          companyName: data.companyName,
          sector: data.sector,
          period: data.period,
          carbonData: data.carbonData,
          waterData: {
            consumoMensual: data.waterData.consumoMensual || 0,
            fuentePrincipal: data.waterData.fuentePrincipal || "",
            intensidadTipo: data.waterData.intensidadTipo || "",
            intensidadValor: data.waterData.intensidadValor || "",
          },
          wasteData: data.wasteData,
          empresaId: data.empresaId,
        });

        setFormData((prev) => ({
          ...prev,
          repYear: (() => {
            const match = prev.period.match(/\b(20\d{2})\b/);
            return match ? Number(match[1]) : "";
          })(),
        }));

        // Cargar registros REP desde backend
        if (data.empresaId) {
          const repResp = await getResiduosRep(data.empresaId);
          setRepList(repResp.data || []); // backend responde { success, data }
        }
      } catch (error) {
        console.error("Error cargando evaluación:", error);
      } finally {
        setCargandoDatos(false);
      }
    }

    load();
  }, [id]);

  // ======================================================
  // 🔧 HANDLE INPUT
  // ======================================================
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

      // --------------------------------
      // 🔵 DETECTAR AÑO REP AUTOMÁTICO
      // --------------------------------
      if (name === "period") {
        const match = value.match(/\b(20\d{2})\b/);
        const ano = match ? Number(match[1]) : "";

        updated.repYear = ano;
      }

      return updated;
    });
  };



  // ======================================================
  // ➕ AGREGAR PRODUCTO REP
  // ======================================================
  const agregarProductoRep = () => {
    const {
      producto,
      subcategoria,
      anio,
      cantidadGenerada,
      cantidadValorizada,
    } = nuevoRep;

    if (!producto || !cantidadGenerada) {
      alert("Completa los campos obligatorios del REP");
      return;
    }

    const porcentaje =
      cantidadGenerada && cantidadValorizada
        ? (Number(cantidadValorizada) / Number(cantidadGenerada)) * 100
        : 0;

    setRepList((prev) => [
      ...prev,
      {
        producto,
        subcategoria,
        anio: formData.repYear,
        cantidadGenerada: Number(cantidadGenerada),
        cantidadValorizada: Number(cantidadValorizada),
        porcentajeValorizacion: porcentaje,
      },
    ]);

    setNuevoRep({
      producto: "",
      subcategoria: "",
      anio: "",
      cantidadGenerada: "",
      cantidadValorizada: "",
      porcentajeValorizacion: 0,
    });
  };

  // ======================================================
  // ❌ ELIMINAR REP
  // ======================================================
  const eliminarProductoRep = (index) => {
    setRepList((prev) => prev.filter((_, i) => i !== index));
  };


  // ======================================================
  // 🟢 VALIDACIÓN (similar a EvaluacionNueva)
  // ======================================================
  const validar = () => {
    const err = {};

    // --- General ---
    if (!formData.companyName.trim())
      err.companyName = "Ingrese nombre";

    if (!formData.sector)
      err.sector = "Seleccione sector";

    if (!formData.period.trim())
      err.period = "Ingrese período";

    // --- Carbono ---
    const c = formData.carbonData;
    ["electricidad", "gas", "diesel", "bencina"].forEach((k) => {
      const v = Number(c[k]);
      if (!v || v <= 0) err[k] = "Debe ser mayor a 0";
    });

    // --- Agua ---
    const w = formData.waterData;

    if (!w.consumoMensual || Number(w.consumoMensual) <= 0)
      err.consumoMensual = "Debe ser mayor a 0";

    if (!w.fuentePrincipal)
      err.fuentePrincipal = "Seleccione fuente";

    // Intensidad hídrica
    if (w.intensidadTipo && (!w.intensidadValor || Number(w.intensidadValor) <= 0)) {
      err.intensidadValor = "Debe ser mayor a 0";
    }

    // --- Residuos ---
    const r = formData.wasteData;

    if (!r.residuosTotales || Number(r.residuosTotales) <= 0)
      err.residuosTotales = "Debe ser mayor a 0";

    if (r.residuosReciclados < 0)
      err.residuosReciclados = "Dato inválido";

    if (Number(r.residuosReciclados) > Number(r.residuosTotales))
      err.residuosReciclados = "No puede superar lo generado";

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  // ======================================================
  // 💾 GUARDAR CAMBIOS
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!validar()) {
      alert("Hay errores en el formulario");
      return;
    }

    setLoading(true);
    setLoading(true);



    try {
      // Recalcular score a partir del formData editado
      const calculos = calcularEvaluacionReal(formData);
      const recomendaciones = generarRecomendaciones(
        calculos.scores,
        calculos.finalScore
      );

      const evaluacionActualizada = {
        ...formData,
        scores: calculos.scores,
        finalScore: calculos.finalScore,
        nivel: calculos.nivel,
        intensidadHidrica: calculos.intensidadHidrica,
        recomendaciones,
      };

      // Guardar evaluación
      await updateEvaluacion(id, evaluacionActualizada);

      // ELIMINAR TODOS LOS REP DE ESTA EMPRESA
      await deleteResiduosRep(formData.empresaId);

      // GUARDAR NUEVA LISTA REP
      for (const rep of repList) {
        await saveResiduosRep({
          empresaId: formData.empresaId,
          producto: rep.producto,
          subcategoria: rep.subcategoria,
          anio: rep.anio,
          cantidadGenerada: rep.cantidadGenerada,
          cantidadValorizada: rep.cantidadValorizada,
          porcentajeValorizacion: rep.porcentajeValorizacion,
        });
      }


      alert("Cambios guardados correctamente ✔️");
      navigate(`/detalle/${id}`);
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 🟡 CARGANDO DATOS
  // ======================================================
  if (cargandoDatos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-green-500 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando datos…</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI PRINCIPAL (MISMO LOOK QUE EvaluacionNueva.jsx)
  // ======================================================
  const irAPaso = (n) => setPaso(n);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Editar Diagnóstico Ambiental
        </h1>

        {/* Indicador pasos (igual que en EvaluacionNueva.jsx) */}
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
                className={`flex-1 mx-1 py-2 rounded-lg text-sm font-semibold transition
                  ${activo
                    ? "bg-green-600 text-white"
                    : completado
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {num}. {et}
              </button>
            );
          })}
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          {/* ---------------- PASO 1 ---------------- */}
          <PasoContainer visible={paso === 1}>
            <PasoTitulo titulo="1. Información General" />

            <Input
              label="Nombre de la Empresa"
              name="companyName"
              type="text"
              value={formData.companyName}
              disabled={true}
            />

            <Select
              label="Sector Industrial"
              name="sector"
              value={formData.sector}
              onChange={handleInput}
              options={[
                "Manufactura",
                "Servicios",
                "Retail",
                "Construcción",
                "Tecnología",
                "Alimentos",
                "Minería",
                "Agrícola",
                "Transporte",
                "Otro",
              ]}
            />

            <Input
              label="Período (Ej: 1er Semestre 2024)"
              name="period"
              type="text"
              value={formData.period}
              onChange={handleInput}
            />
          </PasoContainer>

          {/* ---------------- PASO 2: Carbono ---------------- */}
          <PasoContainer visible={paso === 2}>
            <PasoTitulo titulo="2. Emisiones de Carbono" />

            <Input
              label="Electricidad (kWh/año)"
              name="electricidad"
              type="number"
              value={formData.carbonData.electricidad}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Gas Natural (kg/año)"
              name="gas"
              type="number"
              value={formData.carbonData.gas}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Diésel (litros/año)"
              name="diesel"
              type="number"
              value={formData.carbonData.diesel}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Bencina (litros/año)"
              name="bencina"
              type="number"
              value={formData.carbonData.bencina}
              onChange={(e) => handleInput(e, "carbonData")}
            />
          </PasoContainer>

          {/* ---------------- PASO 3: Agua ---------------- */}
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

            {/* NUEVO — Tipo de Intensidad Hídrica */}
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

            {/* MODO: Consumo por persona */}
            {formData.waterData.intensidadTipo === "Consumo por persona" && (
              <>
                <Input
                  label="Número de trabajadores"
                  name="trabajadores"
                  type="number"
                  value={formData.waterData.trabajadores || ""}
                  onChange={(e) => handleInput(e, "waterData")}
                  error={errores.trabajadores}
                  placeholder="Ej: 25"
                />

                {/* Mostrar intensidad calculada automáticamente */}
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

              </>
            )}

            {/* MODO: Consumo por unidad de producción */}
            {formData.waterData.intensidadTipo === "Consumo por unidad de producción" && (
              <>
                <Input
                  label="Producción mensual (unidades/mes)"
                  name="produccion"
                  type="number"
                  value={formData.waterData.produccion || ""}
                  onChange={(e) => handleInput(e, "waterData")}
                  error={errores.produccion}
                  placeholder="Ej: 1200"
                />

              </>
            )}
          </PasoContainer>

          {/* ---------------- PASO 4: Residuos + REP ---------------- */}
          <PasoContainer visible={paso === 4}>
            <PasoTitulo titulo="4. Gestión de Residuos" />

            <Input
              label="Residuos Totales (kg/año)"
              name="residuosTotales"
              type="number"
              value={formData.wasteData.residuosTotales}
              onChange={(e) => handleInput(e, "wasteData")}
            />

            <Input
              label="Residuos Reciclados (kg/año)"
              name="residuosReciclados"
              type="number"
              value={formData.wasteData.residuosReciclados}
              onChange={(e) => handleInput(e, "wasteData")}
            />

            {/* ---------------- MÓDULO LEY REP ---------------- */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                Gestión de Residuos - Ley REP (Editar / Agregar)
              </h3>

              {/* Formulario para agregar nuevo producto REP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Producto Prioritario"
                  name="producto"
                  value={nuevoRep.producto}
                  onChange={(e) =>
                    setNuevoRep((prev) => ({
                      ...prev,
                      producto: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setNuevoRep((prev) => ({
                      ...prev,
                      subcategoria: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Año (automático según período)"
                  type="number"
                  name="anio"
                  value={formData.repYear ?? ""}
                  disabled={true}
                />

                <Input
                  label="Cantidad Generada (kg/año)"
                  type="number"
                  name="cantidadGenerada"
                  value={nuevoRep.cantidadGenerada}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const porcentaje =
                      nuevoRep.cantidadValorizada && valor
                        ? (Number(nuevoRep.cantidadValorizada) /
                          Number(valor)) *
                        100
                        : 0;

                    setNuevoRep((prev) => ({
                      ...prev,
                      cantidadGenerada: valor,
                      porcentajeValorizacion: porcentaje,
                    }));
                  }}
                />

                <Input
                  label="Cantidad Valorizada (kg/año)"
                  type="number"
                  name="cantidadValorizada"
                  value={nuevoRep.cantidadValorizada}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const porcentaje =
                      nuevoRep.cantidadGenerada && valor
                        ? (Number(valor) /
                          Number(nuevoRep.cantidadGenerada)) *
                        100
                        : 0;

                    setNuevoRep((prev) => ({
                      ...prev,
                      cantidadValorizada: valor,
                      porcentajeValorizacion: porcentaje,
                    }));
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

              {/* Lista REP ya registrados */}
              {repList.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Productos REP registrados:
                  </h4>

                  <ul className="space-y-2">
                    {repList.map((item, i) => (
                      <li
                        key={i}
                        className="p-3 bg-white border rounded flex justify-between items-center gap-4"
                      >
                        <div>
                          <p className="font-medium">{item.producto}</p>
                          <p className="text-sm text-slate-600">
                            {item.subcategoria ?? "Sin subcategoría"} —{" "}
                            {item.anio}
                          </p>
                          <p className="text-sm text-slate-600">
                            {item.cantidadGenerada} kg generada |{" "}
                            {item.cantidadValorizada} kg valorizada (
                            {item.porcentajeValorizacion?.toFixed(1)}%)
                          </p>
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

          {/* ---------- BOTONES ---------- */}
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
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}