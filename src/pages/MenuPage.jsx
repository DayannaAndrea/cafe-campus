import React, { useEffect, useState } from 'react';
import ProductForm from '../components/ProductForm';
import {
  saveProduct,
  watchProducts
} from '../services/productsApi';
import { CATEGORIES, money } from '../validation';
import './menu.css';

export default function MenuPage({ role }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');

  const admin = role === 'administradora';

  // Escuchar los productos de Firestore en tiempo real.
  useEffect(() => {
    return watchProducts(
      (products) => {
        setItems(products);
        setError('');
      },
      (error) => {
        console.error('Error al cargar el menú:', error);
        setError('No fue posible cargar los productos.');
      }
    );
  }, []);

  const visible = items.filter(
    (p) =>
      (category === 'Todos' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  async function save(item) {
    try {
      await saveProduct(item);
      setEdit(null);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      setError('No fue posible guardar el producto.');
    }
  }

  return (
    <>
      <div className="menu-tools">
        <input
          className="search-input"
          placeholder="Buscar producto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="filter-chips">
          <button
            className={category === 'Todos' ? 'selected' : ''}
            onClick={() => setCategory('Todos')}
          >
            Todos
          </button>

          {CATEGORIES.map((c) => (
            <button
              className={category === c ? 'selected' : ''}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {admin && (
          <button
            className="action-button"
            onClick={() => setEdit('new')}
          >
            ＋ Nuevo producto
          </button>
        )}
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="product-grid">
        {visible.map((p) => (
          <article
            className={`product-card ${!p.available ? 'dimmed' : ''}`}
            key={p.id}
          >
            <div className="product-art">
              <span>{p.emoji}</span>
              <i className={p.available ? 'available' : 'unavailable'}>
                {p.available ? 'Disponible' : 'Agotado'}
              </i>
            </div>

            <div className="product-info">
              <small>{p.category}</small>
              <h3>{p.name}</h3>

              <div>
                <b>{money(p.price)}</b>

                {admin && (
                  <button
                    className="quiet-button"
                    onClick={() => setEdit(p)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {edit && (
        <ProductForm
          initial={edit === 'new' ? null : edit}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
