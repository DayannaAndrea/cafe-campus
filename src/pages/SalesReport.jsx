// Ventas del día por producto y franja horaria (indicador 3). Refs CAF-10.
import React, { useEffect, useState } from "react";
import { getSalesReport } from "../services/salesApi";
import "./salesReport.css";

const todayInColombia = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());

const formatCOP = (value = 0) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export default function SalesReport() {
  const [date, setDate] = useState(todayInColombia);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getSalesReport(date)
      .then((data) => active && setReport(data))
      .catch((failure) => {
        console.error("Error al cargar las ventas:", failure);
        if (active) setError("No fue posible cargar las ventas de ese día.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [date]);

  const maxSlot = Math.max(1, ...(report?.bySlot || []).map((s) => s.amount));

  return (
    <div className="sales-report">
      <div className="sales-toolbar">
        <label>
          Día
          <input
            type="date"
            value={date}
            max={todayInColombia()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        {report && !loading && (
          <p>
            <b>{formatCOP(report.totalAmount)}</b> en ventas · <b>{report.totalUnits}</b> unidades
          </p>
        )}
      </div>

      {error && <p className="sales-error" role="alert">{error}</p>}
      {loading && <p className="sales-empty">Cargando ventas…</p>}

      {!loading && report && report.byProduct.length === 0 && (
        <p className="sales-empty">No hay ventas pagadas ese día.</p>
      )}

      {!loading && report && report.byProduct.length > 0 && (
        <div className="sales-grid">
          <section className="sales-card">
            <h3>Ventas por franja de 15 minutos</h3>
            <ul className="sales-bars">
              {report.bySlot.map((slot) => (
                <li key={slot.key}>
                  <span className="sales-slot">{slot.label}</span>
                  <span className="sales-bar">
                    <i style={{ width: `${(slot.amount / maxSlot) * 100}%` }} />
                  </span>
                  <span className="sales-value">
                    {formatCOP(slot.amount)} · {slot.units} u.
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="sales-card">
            <h3>Ventas por producto</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {report.byProduct.map((product) => (
                  <tr key={product.name}>
                    <td>{product.name}</td>
                    <td>{product.units}</td>
                    <td>{formatCOP(product.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="sales-hint">
              Compara las unidades vendidas con las que se prepararon para saber cuántas sobran (indicador 3).
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
