// Pruebas automáticas del reporte de ventas. Refs CAF-10.
import { describe, expect, it } from "vitest";
import { buildSalesReport, slotLabel } from "../src/services/salesReport";

// Pagos de la demostración: tinto y jugo en efectivo (10:05) y el pedido de Laura por transferencia (10:31).
const orders = [
  {
    payment: { paidAt: "2026-11-19T15:05:00Z" },
    items: [
      { name: "Café tinto 7 oz", qty: 1, price: 2000 },
      { name: "Jugo natural en agua", qty: 1, price: 5000 },
    ],
  },
  {
    payment: { paidAt: "2026-11-19T15:31:00Z" },
    items: [
      { name: "Empanada de carne", qty: 2, price: 3000 },
      { name: "Café con leche", qty: 1, price: 3500 },
    ],
  },
  { payment: null, items: [{ name: "Pandebono", qty: 1, price: 2500 }] },
];

describe("slotLabel", () => {
  it("redondea a la franja de 15 minutos en hora de Colombia", () => {
    expect(slotLabel("2026-11-19T15:07:00Z").label).toBe("10:00 a. m.");
    expect(slotLabel("2026-11-19T15:31:00Z").label).toBe("10:30 a. m.");
  });
});

describe("buildSalesReport", () => {
  const report = buildSalesReport(orders);

  it("suma solo los pedidos pagados", () => {
    expect(report.totalAmount).toBe(16500);
    expect(report.totalUnits).toBe(5);
  });

  it("ordena los productos por unidades vendidas", () => {
    expect(report.byProduct[0]).toEqual({ name: "Empanada de carne", units: 2, amount: 6000 });
  });

  it("agrupa las ventas por franja", () => {
    expect(report.bySlot.map((s) => [s.label, s.amount])).toEqual([
      ["10:00 a. m.", 7000],
      ["10:30 a. m.", 9500],
    ]);
  });
});
