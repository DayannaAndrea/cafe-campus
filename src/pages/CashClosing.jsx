import React, { useEffect, useState } from "react";
import {
  createCashClosing,
  getCashClosing,
  getDailyPayments,
} from "../services/cashClosingApi";

const todayInColombia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());

const formatCOP = (value = 0) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export default function CashClosing() {
  const [date, setDate] = useState(todayInColombia);
  const [summary, setSummary] = useState(null);
  const [closing, setClosing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dailySummary, savedClosing] = await Promise.all([
        getDailyPayments(date),
        getCashClosing(date),
      ]);

      setSummary(dailySummary);
      setClosing(savedClosing);
    } catch (err) {
      console.error("Error consultando el cierre:", err);
      setError("No fue posible consultar los pagos del día.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleClose = async () => {
    if (!summary || closing || saving) return;

    const confirmed = window.confirm(
      `¿Confirmas el cierre de caja del ${date}?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

    try {
      await createCashClosing(summary);
      await loadData();
    } catch (err) {
      console.error("Error registrando el cierre:", err);
      setError(err.message || "No fue posible registrar el cierre.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cash-closing">
      <section className="content-card">
        <span className="kicker">CONTROL DE CAJA</span>
        <h3>Cierre diario</h3>
        <p>
          Consulta los pagos recibidos y verifica los valores
          recaudados por cada método de pago.
        </p>

        <label htmlFor="closing-date">Fecha del cierre</label>
        <input
          id="closing-date"
          type="date"
          value={date}
          max={todayInColombia()}
          onChange={(event) => setDate(event.target.value)}
        />
      </section>

      {loading ? (
        <p>Consultando pagos...</p>
      ) : error ? (
        <section className="content-card">
          <p role="alert">{error}</p>
          <button onClick={loadData}>Reintentar</button>
        </section>
      ) : summary ? (
        <>
          <div className="stats">
            <article>
              <span>💵</span>
              <small>Total en efectivo</small>
              <b>{formatCOP(summary.cashTotal)}</b>
            </article>

            <article>
              <span>📲</span>
              <small>Total en transferencias</small>
              <b>{formatCOP(summary.transferTotal)}</b>
            </article>

            <article>
              <span>▤</span>
              <small>Pedidos pagados</small>
              <b>{summary.ordersCount}</b>
            </article>
          </div>

          <section className="content-card">
            <span className="kicker">RESUMEN DEL DÍA</span>
            <h2>{formatCOP(summary.grandTotal)}</h2>
            <p>Total recaudado el {date}.</p>

            {closing ? (
              <p>
                Cierre registrado. Ya existe un cierre para esta fecha.
              </p>
            ) : (
              <button onClick={handleClose} disabled={saving}>
                {saving ? "Registrando cierre..." : "Confirmar cierre de caja"}
              </button>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
