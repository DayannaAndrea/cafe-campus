// Pruebas automatizadas de CAF-02 (RN-A4).
import { describe, expect, it } from 'vitest';
import { formatoPesos, validarPrecio, validarProducto } from '../src/validation';

describe('validarPrecio (RN-A4)', () => {
  it('acepta enteros positivos', () => {
    expect(validarPrecio('2000')).toBeNull();
    expect(validarPrecio(14000)).toBeNull();
  });
  it('rechaza decimales, negativos, cero y vacío', () => {
    expect(validarPrecio('2500.5')).not.toBeNull();
    expect(validarPrecio('-100')).not.toBeNull();
    expect(validarPrecio('0')).not.toBeNull();
    expect(validarPrecio('')).not.toBeNull();
    expect(validarPrecio('abc')).not.toBeNull();
  });
});

describe('validarProducto', () => {
  it('acepta un producto válido', () => {
    expect(validarProducto({ nombre: 'Café tinto 7 oz', categoria: 'Bebidas calientes', precio: '2000' })).toEqual({});
  });
  it('reporta nombre corto y categoría faltante', () => {
    const e = validarProducto({ nombre: 'Te', categoria: '', precio: '2000' });
    expect(e.nombre).toBeDefined();
    expect(e.categoria).toBeDefined();
  });
});

describe('formatoPesos', () => {
  it('usa punto de miles sin decimales', () => {
    expect(formatoPesos(16500)).toBe('$16.500');
  });
});
