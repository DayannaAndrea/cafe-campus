import React, { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import {
  saveProduct,
  watchProducts,
  updateProductAvailability,
} from "../services/productsApi";
import { CATEGORIES, money } from "../validation";
import "./menu.css";

export default function MenuPage({ role }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");

  const admin = ["administradora", "administrador", "admin"].includes(
    String(role || "")
      .trim()
      .toLowerCase(),
  );

  // Escuchar los productos de Firestore en tiempo real.
  useEffect(() => {
    return watchProducts(
      (products) => {
        setItems(products);
        setError("");
      },
      (err) => {
        console.error("Error al cargar el menú:", err);
        setError("No fue posible cargar los productos.");
      },
    );
  }, []);

  // Filtrar productos por categoría y nombre.
  const visible = items.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Crear o editar un producto.
  async function save(item) {
    try {
      setError("");
      await saveProduct(item);
      setEdit(null);
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError("No fue posible guardar el producto.");
    }
  }

  // Cambiar la disponibilidad de un producto.
  async function toggleAvailability(product) {
    try {
      setError("");
      await updateProductAvailability(product.id, !product.available);
    } catch (err) {
      console.error("Error al cambiar disponibilidad:", err);
      setError("No fue posible actualizar la disponibilidad del producto.");
    }
  }

  return (
    <>
      <div className="menu-tools">
        <input
          className="search-input"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="filter-chips">
          <button
            className={category === "Todos" ? "selected" : ""}
            onClick={() => setCategory("Todos")}
          >
            Todos
          </button>

          {CATEGORIES.map((c) => (
            <button
              className={category === c ? "selected" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {admin && (
          <button className="action-button" onClick={() => setEdit("new")}>
            + Nuevo producto
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="product-grid">
        {visible.map((p) => (
          <article
            className={`product-card ${!p.available ? "dimmed" : ""}`}
            key={p.id}
          >
            <div className="product-art">
              <span>{p.emoji}</span>
              <i className={p.available ? "available" : "unavailable"}>
                {p.available ? "Disponible" : "Agotado"}
              </i>
            </div>

            <div className="product-info">
              <small>{p.category}</small>
              <h3>{p.name}</h3>

              <div>
                <b>{money(p.price)}</b>

                {admin && (
                  <div className="product-controls">
                    <button className="quiet-button" onClick={() => setEdit(p)}>
                      Editar
                    </button>

                    <button
                      className={`stock-toggle ${p.available ? "on" : ""}`}
                      onClick={() => toggleAvailability(p)}
                    >
                      {p.available ? "Marcar agotado" : "Volver a ofrecer"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {edit && (
        <ProductForm
          initial={edit === "new" ? null : edit}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
