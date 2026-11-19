// Reporte de ventas del día por producto y franja horaria. Refs CAF-10.
// Reutiliza los pagos del día que lee el cierre de caja (CAF-09).
import { getDailyPayments } from "./cashClosingApi";
import { buildSalesReport } from "./salesReport";

export async function getSalesReport(date) {
  const { orders } = await getDailyPayments(date);
  return { date, ...buildSalesReport(orders) };
}
