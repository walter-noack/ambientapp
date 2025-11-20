import React from "react";

export default function ResumenModal({ open, onClose, onConfirm, data }) {
  if (!open) return null;

  const { companyName, sector, period, carbonData, waterData, wasteData } = data;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn">
        
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Confirmar datos de la evaluación
        </h2>

        {/* CONTENIDO */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">

          {/* GENERAL */}
          <div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Información General</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Empresa:</strong> {companyName}</p>
              <p><strong>Sector:</strong> {sector}</p>
              <p><strong>Periodo:</strong> {period}</p>
            </div>
          </div>

          {/* CARBONO */}
          <div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Emisiones (Alcance 1 y 2)</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Electricidad (kWh):</strong> {carbonData.electricidad}</p>
              <p><strong>Gas Natural (kg):</strong> {carbonData.gas}</p>
              <p><strong>Diésel (L):</strong> {carbonData.diesel}</p>
              <p><strong>Bencina (L):</strong> {carbonData.bencina}</p>
            </div>
          </div>

          {/* AGUA */}
          <div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Consumo de Agua</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Consumo mensual (L):</strong> {waterData.consumoMensual}</p>
              <p><strong>Fuente principal:</strong> {waterData.fuentePrincipal}</p>
            </div>
          </div>

          {/* RESIDUOS */}
          <div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Gestión de Residuos</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Totales (kg):</strong> {wasteData.residuosTotales}</p>
              <p><strong>Reciclados (kg):</strong> {wasteData.residuosReciclados}</p>
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Volver
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}