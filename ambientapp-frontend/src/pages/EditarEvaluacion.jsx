// 📌 EditarEvaluacion.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEvaluacionById,
  updateEvaluacion,
  getResiduosRep,
  saveResiduosRep,
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
    waterData: { consumoMensual: 0, fuentePrincipal: "" },
    wasteData: { residuosTotales: 0, residuosReciclados: 0 },
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
      const data = await getEvaluacionById(id);
      if (!data) return;

      setFormData({
        companyName: data.companyName,
        sector: data.sector,
        period: data.period,
        carbonData: data.carbonData,
        waterData: data.waterData,
        wasteData: data.wasteData,
        empresaId: data.empresaId,
      });

      // 🟢 cargar registros REP
      if (data.empresaId) {
        const repResp = await getResiduosRep(data.empresaId);
        setRepList(repResp.data); // backend responde { success, data }
      }

      setCargandoDatos(false);
    }

    load();
  }, [id]);

  // ======================================================
  // 🔧 HANDLE INPUT
  // ======================================================
  const handleInput = (e, categoria = null) => {
    const { name, value } = e.target;

    setFormData((prev) =>
      categoria
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
        }
    );
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

    if (!producto || !anio || !cantidadGenerada) {
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
        anio: Number(anio),
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
    setRepList(repList.filter((_, i) => i !== index));
  };

  // ======================================================
  // 💾 GUARDAR CAMBIOS
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // recalcular score
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
        recommendations: generarRecomendaciones(
          calculos.scores,
          calculos.finalScore
        ),
      };

      // 🔵 guardar evaluación
      await updateEvaluacion(id, evaluacionActualizada);

      // 🔵 guardar REP actualizado (elimina/añade todos)
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
      navigate(`/evaluaciones/${id}`);
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
  // UI PRINCIPAL
  // ======================================================
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Editar Evaluación
        </h1>

        {/* Pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  onClick={() => setPaso(num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition
                  ${paso === num
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                >
                  {num}
                </div>

                {num < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${paso > num ? "bg-green-500" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>General</span>
            <span>Carbono</span>
            <span>Agua</span>
            <span>Residuos</span>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          {/* ---------- PASO 1 ---------- */}
          <PasoContainer visible={paso === 1}>
            <PasoTitulo titulo="1. Información General" />

            <Input
              label="Nombre de la Empresa *"
              name="companyName"
              type="text"
              value={formData.companyName}
              disabled={true}
            />

            <Select
              label="Sector Industrial *"
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
              label="Período de Evaluación *"
              name="period"
              type="text"
              value={formData.period}
              onChange={handleInput}
            />
          </PasoContainer>

          {/* ---------- PASO 2: Carbono ---------- */}
          <PasoContainer visible={paso === 2}>
            <PasoTitulo titulo="2. Emisiones de Carbono" />

            <Input
              label="Electricidad (kWh)"
              name="electricidad"
              type="number"
              value={formData.carbonData.electricidad}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Gas Natural (kg)"
              name="gas"
              type="number"
              value={formData.carbonData.gas}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Diésel (litros)"
              name="diesel"
              type="number"
              value={formData.carbonData.diesel}
              onChange={(e) => handleInput(e, "carbonData")}
            />

            <Input
              label="Bencina (litros)"
              name="bencina"
              type="number"
              value={formData.carbonData.bencina}
              onChange={(e) => handleInput(e, "carbonData")}
            />
          </PasoContainer>

          {/* ---------- PASO 3: Agua ---------- */}
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
          </PasoContainer>

          {/* ---------- PASO 4: Residuos + REP ---------- */}
          <PasoContainer visible={paso === 4}>
            <PasoTitulo titulo="4. Gestión de Residuos" />

            <Input
              label="Residuos Totales (kg)"
              name="residuosTotales"
              type="number"
              value={formData.wasteData.residuosTotales}
              onChange={(e) => handleInput(e, "wasteData")}
            />

            <Input
              label="Residuos Reciclados (kg)"
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

              {/* Agregar nuevo REP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Producto Prioritario"
                  name="producto"
                  value={nuevoRep.producto}
                  onChange={(e) =>
                    setNuevoRep({ ...nuevoRep, producto: e.target.value })
                  }
                  options={[
                    "Envases y Embalajes",
                    "Neumáticos",
                    "Aceites Lubricantes",
                    "Aparatos Electrónicos",
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
                    setNuevoRep({ ...nuevoRep, subcategoria: e.target.value })
                  }
                />

                <Input
                  label="Año"
                  type="number"
                  name="anio"
                  value={nuevoRep.anio}
                  onChange={(e) =>
                    setNuevoRep({ ...nuevoRep, anio: e.target.value })
                  }
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

                    setNuevoRep({
                      ...nuevoRep,
                      cantidadGenerada: valor,
                      porcentajeValorizacion: porcentaje,
                    });
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

                    setNuevoRep({
                      ...nuevoRep,
                      cantidadValorizada: valor,
                      porcentajeValorizacion: porcentaje,
                    });
                  }}
                />
              </div>

              {nuevoRep.porcentajeValorizacion > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {nuevoRep.porcentajeValorizacion.toFixed(1)}% valorizado
                </p>
              )}

              <button
                type="button"
                onClick={agregarProductoRep}
                className="btn-primary mt-4"
              >
                + Agregar Producto REP
              </button>

              {/* Lista REP */}
              {repList.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Productos REP registrados:
                  </h4>

                  <ul className="space-y-2">
                    {repList.map((item, i) => (
                      <li
                        key={i}
                        className="p-3 bg-white border rounded flex justify-between items-center"
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