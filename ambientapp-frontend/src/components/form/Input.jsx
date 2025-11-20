// src/components/form/Input.jsx
export default function Input({
  label,
  name,
  type = "text",
  value,
  placeholder = "",
  onChange,
  disabled = false,
  error = null,          // ← agregado
  warning = null,        // ← agregado opcional
}) {
  const hayError = error;
  const hayAdvertencia = !error && warning;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg bg-white text-slate-800
          focus:outline-none focus:ring-2
          ${hayError
            ? "border-red-500 focus:ring-red-500"
            : hayAdvertencia
            ? "border-amber-400 focus:ring-amber-400"
            : "border-slate-300 focus:ring-green-500"}
          ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}
        `}
      />

      {hayError && (
        <p className="text-red-600 text-sm mt-1">{hayError}</p>
      )}

      {!hayError && hayAdvertencia && (
        <p className="text-amber-600 text-sm mt-1">{hayAdvertencia}</p>
      )}
    </div>
  );
}