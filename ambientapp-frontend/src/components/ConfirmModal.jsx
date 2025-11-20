export default function ConfirmModal({ visible, onCancel, onConfirm }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80 animate-fade-in">
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Confirmar eliminación
        </h2>

        <p className="text-slate-600 mb-6 text-sm">
          ¿Estás seguro de que deseas eliminar esta evaluación?  
          <br />Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}