export function getUsuarioActual() {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  return JSON.parse(stored);
}

export function getToken() {
  return localStorage.getItem("token");
}