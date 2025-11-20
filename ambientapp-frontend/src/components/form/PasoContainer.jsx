// src/components/form/PasoContainer.jsx
export default function PasoContainer({ visible, children }) {
  return (
    <div
      className={`transition-all duration-300 ${
        visible ? "block opacity-100" : "hidden opacity-0"
      }`}
    >
      {children}
    </div>
  );
}