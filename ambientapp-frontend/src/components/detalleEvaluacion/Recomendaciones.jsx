export default function Recomendaciones({ recomendaciones }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        Recomendaciones Prioritarias
      </h2>

      <ul className="list-disc ml-6 text-sm text-gray-700">
        {recomendaciones.map((r, i) => (
          <li key={i} className="mb-1">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}