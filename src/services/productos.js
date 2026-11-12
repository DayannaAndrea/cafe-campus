// Almacenamiento local para la demo: los cambios quedan en este navegador.
const STORAGE_KEY = 'cafe-campus-products';
const PRODUCTOS_INICIALES = [
  { id: 'demo-1', nombre: 'Café tinto 7 oz', categoria: 'Bebidas calientes', precio: 2000, disponible: true },
  { id: 'demo-2', nombre: 'Café con leche', categoria: 'Bebidas calientes', precio: 3500, disponible: true },
  { id: 'demo-3', nombre: 'Empanada de carne', categoria: 'Panadería', precio: 3000, disponible: true },
  { id: 'demo-4', nombre: 'Pandebono', categoria: 'Panadería', precio: 2500, disponible: false },
  { id: 'demo-5', nombre: 'Jugo natural en agua', categoria: 'Bebidas frías', precio: 5000, disponible: true },
  { id: 'demo-6', nombre: 'Almuerzo del día', categoria: 'Almuerzos', precio: 14000, disponible: true },
];
const listeners = new Set();

function leerProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(guardados) ? guardados : PRODUCTOS_INICIALES;
  } catch {
    return PRODUCTOS_INICIALES;
  }
}

function ordenar(items) {
  return [...items].sort((a, b) => a.categoria.localeCompare(b.categoria, 'es') || a.nombre.localeCompare(b.nombre, 'es'));
}

function notificar() {
  const items = ordenar(leerProductos());
  listeners.forEach((listener) => listener(items));
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) notificar();
  });
}

export function escucharProductos(onProducts, onError) {
  const listener = (items) => onProducts(items);
  listeners.add(listener);
  try {
    onProducts(ordenar(leerProductos()));
  } catch (error) {
    onError?.(error);
  }
  return () => listeners.delete(listener);
}

export async function crearProducto(datos) {
  const items = leerProductos();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...items, { ...datos, id }]));
  notificar();
  return { id };
}

export async function actualizarProducto(id, datos) {
  const items = leerProductos();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('No se encontró el producto.');
  items[index] = { ...items[index], ...datos };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notificar();
}
