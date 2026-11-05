// Reglas de validación del menú. Refs CAF-02, RN-A4.

export const CATEGORIAS = ['Bebidas calientes', 'Bebidas frías', 'Panadería', 'Almuerzos'];

export const ROLES = { ADMIN: 'administradora', CAJERO: 'cajero' };

// RN-A4: los valores en pesos se guardan como enteros, sin decimales.
export function validarPrecio(valor) {
  const texto = String(valor ?? '').trim();
  if (texto === '') return 'El precio es obligatorio';
  if (!/^\d+$/.test(texto)) return 'El precio debe ser un número entero mayor que 0';
  const n = Number(texto);
  if (n <= 0) return 'El precio debe ser un número entero mayor que 0';
  if (n > 1000000) return 'El precio no puede superar $1.000.000';
  return null;
}

export function validarProducto({ nombre, categoria, precio }) {
  const errores = {};
  const limpio = String(nombre ?? '').trim();
  if (limpio.length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres';
  if (limpio.length > 60) errores.nombre = 'El nombre no puede superar 60 caracteres';
  if (!CATEGORIAS.includes(categoria)) errores.categoria = 'Elige una categoría';
  const errPrecio = validarPrecio(precio);
  if (errPrecio) errores.precio = errPrecio;
  return errores;
}

export function formatoPesos(n) {
  return '$' + Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
