import React, { useEffect, useState } from "react";
import {
  createCashClosing,
  getCashClosing,
  getDailyPayments,
} from "../services/cashClosingApi";
import "./cashClosing.css";

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

const formatDateLabel = (date) =>
  new Date(`${date}T12:00:00-05:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });

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
      `¿Confirmas el cierre de caja del ${date}?`,
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
      <section className="closing-overview">
        <div className="closing-overview-copy">
          <span className="closing-eyebrow">CONTROL DE CAJA</span>
          <h2>Cierre diario</h2>
          <p>
            Revisa los pagos recibidos y el recaudo de la cafetería por método
            de pago.
          </p>
        </div>

        <div className="closing-date-control">
          <label htmlFor="closing-date">Fecha del cierre</label>
          <div className="closing-date-input">
            <input
              id="closing-date"
              type="date"
              value={date}
              max={todayInColombia()}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <small>Selecciona un día para consultar sus recaudos.</small>
        </div>
      </section>

      {loading ? (
        <div className="closing-feedback" role="status">
          <span className="closing-spinner" aria-hidden="true" />
          Consultando los pagos del día…
        </div>
      ) : error ? (
        <section className="closing-error" role="alert">
          <div>
            <span className="closing-error-mark" aria-hidden="true">
              !
            </span>
            <div>
              <strong>No se pudo cargar el cierre</strong>
              <p>{error}</p>
            </div>
          </div>
          <button type="button" onClick={loadData}>
            Reintentar
          </button>
        </section>
      ) : summary ? (
        <>
          <div className="closing-metrics">
            <article className="closing-metric">
              <span
                className="closing-metric-icon cash-icon"
                aria-hidden="true"
              >
                $
              </span>
              <small>Total en efectivo</small>
              <strong>{formatCOP(summary.cashTotal)}</strong>
            </article>

            <article className="closing-metric">
              <span
                className="closing-metric-icon transfer-icon"
                aria-hidden="true"
              >
                ↗
              </span>
              <small>Total en transferencias</small>
              <strong>{formatCOP(summary.transferTotal)}</strong>
            </article>

            <article className="closing-metric">
              <span
                className="closing-metric-icon orders-icon"
                aria-hidden="true"
              >
                #
              </span>
              <small>Pedidos pagados</small>
              <strong>{summary.ordersCount}</strong>
            </article>
          </div>

          <section className="closing-total-card">
            <div className="closing-total-copy">
              <span className="closing-eyebrow">RESUMEN DEL DÍA</span>
              <h3>{formatCOP(summary.grandTotal)}</h3>
              <p>
                Recaudado el {formatDateLabel(date)} · {summary.ordersCount}{" "}
                {summary.ordersCount === 1
                  ? "pedido pagado"
                  : "pedidos pagados"}
              </p>
            </div>

            <div className="closing-total-action">
              {closing ? (
                <div className="closing-saved" role="status">
                  <span aria-hidden="true">✓</span>
                  <div>
                    <strong>Cierre registrado</strong>
                    <small>Este día ya quedó guardado.</small>
                  </div>
                </div>
              ) : (
                <>
                  <span className="closing-pending">CIERRE PENDIENTE</span>
                  <button
                    className="closing-submit"
                    type="button"
                    onClick={handleClose}
                    disabled={saving}
                  >
                    <span>
                      {saving ? "Registrando cierre…" : "Confirmar cierre"}
                    </span>
                    {!saving && <span aria-hidden="true">→</span>}
                  </button>
                  <small className="closing-action-hint">
                    Solo se puede registrar un cierre por fecha.
                  </small>
                </>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
