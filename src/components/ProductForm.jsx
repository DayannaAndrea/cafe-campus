import React, { useState } from 'react';
import { CATEGORIES, validateProduct } from '../validation';
import './forms.css';

export default function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || '',
    price: initial?.price ?? '',
    available: initial?.available ?? true
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();

    const result = validateProduct(form);
    setErrors(result);

    if (Object.keys(result).length > 0) {
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...initial,
        ...form,
        id: initial?.id,
        price: Number(form.price)
      });
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      setErrors({
        general: 'No fue posible guardar el producto. Inténtalo nuevamente.'
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) =>
        e.target === e.currentTarget && !saving && onClose()
      }
    >
      <form className="dialog" onSubmit={submit}>
        <div className="dialog-top">
          <div>
            <span className="kicker">CAF-02 · MENÚ</span>
            <h2>{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <label>
          Nombre
          <input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            disabled={saving}
          />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label>
          Categoría
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            disabled={saving}
          >
            <option value="">Selecciona</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <small>{errors.category}</small>}
        </label>

        <label>
          Precio en pesos
          <input
            type="number"
            min="1"
            step="1"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            disabled={saving}
          />
          {errors.price && <small>{errors.price}</small>}
        </label>

        <label className="check-line">
          Disponible
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) =>
              setForm({ ...form, available: e.target.checked })
            }
            disabled={saving}
          />
        </label>

        {errors.general && (
          <p role="alert">{errors.general}</p>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="quiet-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            className="action-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
