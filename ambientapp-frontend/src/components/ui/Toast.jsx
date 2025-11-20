import { useEffect } from "react";

export default function Toast({ show, type = "success", message, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg text-white shadow-lg ${colors[type]} animate-slideIn`}>
      {message}
    </div>
  );
}