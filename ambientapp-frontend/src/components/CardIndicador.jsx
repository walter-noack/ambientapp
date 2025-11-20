function CardIndicador({ titulo, valor, unidad, icono, color = 'green' }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };
  
  return (
    <div className={`card ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{titulo}</p>
          <p className="text-3xl font-bold mt-2">
            {valor}
            {unidad && <span className="text-lg ml-1">{unidad}</span>}
          </p>
        </div>
        {icono && (
          <div className="text-4xl opacity-50">
            {icono}
          </div>
        )}
      </div>
    </div>
  );
}

export default CardIndicador;