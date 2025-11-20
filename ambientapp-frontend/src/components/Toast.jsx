import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white 
        text-sm font-semibold animate-fade-in
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </div>
  );
}