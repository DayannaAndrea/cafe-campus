// Formulario de producto. Refs CAF-02, RN-A4.
import { useState } from 'react';
import { CATEGORIAS, validarProducto } from '../validation';

export default function ProductForm({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    nombre: inicial?.nombre ?? '',
    categoria: inicial?.categoria ?? '',
    precio: inicial?.precio != null ? String(inicial.precio) : '',
    disponible: inicial?.disponible ?? true,
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  const cambiar = (campo) => (e) =>
    setForm({ ...form, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validarProducto(form);
    setErrores(errs);
    if (Object.keys(errs).length) return;
    setGuardando(true);
    setErrorGeneral('');
    try {
      await onGuardar({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        precio: Number(form.precio.trim()),
        disponible: form.disponible,
      });
    } catch {
      setErrorGeneral('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <form className="tarjeta formulario" onSubmit={onSubmit} noValidate>
      <h2>{inicial ? 'Editar producto' : 'Nuevo producto'}</h2>

      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" value={form.nombre} onChange={cambiar('nombre')} />
      {errores.nombre && <p className="error">{errores.nombre}</p>}

      <label htmlFor="categoria">Categoría</label>
      <select id="categoria" value={form.categoria} onChange={cambiar('categoria')}>
        <option value="">Elige una categoría</option>
        {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {errores.categoria && <p className="error">{errores.categoria}</p>}

      <label htmlFor="precio">Precio en pesos (sin puntos ni decimales)</label>
      <input id="precio" inputMode="numeric" placeholder="2000" value={form.precio}
        onChange={cambiar('precio')} />
      {errores.precio && <p className="error">{errores.precio}</p>}

      <label className="check">
        <input type="checkbox" checked={form.disponible} onChange={cambiar('disponible')} />
        Disponible
      </label>

      {errorGeneral && <p className="error" role="alert">{errorGeneral}</p>}

      <div className="acciones">
        <button type="button" onClick={onCancelar}>Cancelar</button>
        <button className="primario" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
