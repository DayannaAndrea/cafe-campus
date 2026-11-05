// Menú de productos. Refs CAF-02 (gestión) y CAF-01 (permisos por rol, RN-A5).
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { actualizarProducto, crearProducto, escucharProductos } from '../services/productos';
import ProductForm from '../components/ProductForm';
import { CATEGORIAS, ROLES, formatoPesos } from '../validation';

export default function Menu() {
  const { usuario, salir } = useAuth();
  const esAdmin = usuario.rol === ROLES.ADMIN;
  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(null); // null | 'nuevo' | producto
  const [error, setError] = useState('');

  useEffect(() => escucharProductos(setProductos, () => setError('No se pudo cargar el menú.')), []);

  async function guardar(datos) {
    if (editando === 'nuevo') {
      await crearProducto(datos, usuario.uid);
    } else {
      await actualizarProducto(editando.id, datos, usuario.uid);
    }
    setEditando(null);
  }

  return (
    <div className="app">
      <header className="barra">
        <strong>Café Campus</strong>
        <span className="usuario">{usuario.nombre} · {usuario.rol}</span>
        <button onClick={salir}>Salir</button>
      </header>

      <main className="contenido">
        <div className="titulo">
          <h1>Menú</h1>
          {esAdmin && !editando && (
            <button className="primario" onClick={() => setEditando('nuevo')}>+ Agregar producto</button>
          )}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        {esAdmin && editando && (
          <ProductForm
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            inicial={editando === 'nuevo' ? null : editando}
            onGuardar={guardar}
            onCancelar={() => setEditando(null)}
          />
        )}

        {CATEGORIAS.map((cat) => {
          const lista = productos.filter((p) => p.categoria === cat);
          if (!lista.length) return null;
          return (
            <section key={cat}>
              <h2 className="categoria">{cat}</h2>
              <ul className="productos">
                {lista.map((p) => (
                  <li key={p.id} className={p.disponible ? '' : 'agotado'}>
                    <div>
                      <span className="nombre">{p.nombre}</span>
                      {!p.disponible && <span className="etiqueta">Agotado</span>}
                    </div>
                    <span className="precio">{formatoPesos(p.precio)}</span>
                    {esAdmin && <button onClick={() => setEditando(p)}>Editar</button>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {!productos.length && !error && <p className="vacio">Aún no hay productos en el menú.</p>}
      </main>
    </div>
  );
}
