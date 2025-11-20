export default function SelloAmbiental({ score }) {
  let nivel = "";
  let bg = "";
  let color = "";

  if (score <= 39) {
    nivel = "BÁSICO";
    bg = "#fee2e2"; // rojo claro
    color = "#b91c1c"; 
  } else if (score <= 59) {
    nivel = "INTERMEDIO";
    bg = "#fef9c3"; // amarillo claro
    color = "#ca8a04";
  } else if (score <= 79) {
    nivel = "AVANZADO";
    bg = "#ffedd5"; // naranja claro
    color = "#ea580c";
  } else {
    nivel = "LÍDER";
    bg = "#d1fae5"; // verde claro
    color = "#047857";
  }

  return (
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: "50%",
        background: bg,
        color: color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        margin: "20px auto",
        border: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 16 }}>{nivel}</div>
      <div style={{ fontSize: 28 }}>{score}</div>
      <div style={{ fontSize: 14 }}>pts</div>
    </div>
  );
}