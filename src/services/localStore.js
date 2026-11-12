// Capa de datos simulada. Para conectar el backend después, cambia estas funciones
// por llamadas HTTP sin acoplar los componentes de pantalla a localStorage.
export function readLocal(key, fallback) {
  try { const value = localStorage.getItem(`cafe-campus:${key}`); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
export function writeLocal(key, value) {
  localStorage.setItem(`cafe-campus:${key}`, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(`cafe-campus:${key}`));
  return value;
}
export function subscribeLocal(key, callback) {
  const eventName = `cafe-campus:${key}`;
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}
