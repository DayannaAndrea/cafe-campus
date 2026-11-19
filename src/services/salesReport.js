// Agrupa las ventas pagadas por producto y por franja de 15 minutos. Refs CAF-10.
// No usa Firebase, para poder probarse sin conexión (tests/salesReport.test.js).

const SLOT_MINUTES = 15;

const toDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : new Date(value);

// Hora de inicio de la franja en hora de Colombia, por ejemplo "10:15 a. m.".
export function slotLabel(date) {
  const start = new Date(date);
  start.setSeconds(0, 0);
  start.setMinutes(Math.floor(start.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES);
  return {
    key: start.toISOString().slice(0, 16),
    label: start.toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Bogota",
    }),
  };
}

// orders: pedidos con payment.paidAt e items [{ name, qty, price }].
export function buildSalesReport(orders) {
  const products = new Map();
  const slots = new Map();

  for (const order of orders) {
    if (!order?.payment?.paidAt) continue;
    const slot = slotLabel(toDate(order.payment.paidAt));
    const current = slots.get(slot.key) || { ...slot, units: 0, amount: 0, orders: 0 };
    current.orders += 1;

    for (const item of order.items || []) {
      const qty = Number(item.qty) || 0;
      const amount = qty * (Number(item.price) || 0);
      const product = products.get(item.name) || { name: item.name, units: 0, amount: 0 };
      product.units += qty;
      product.amount += amount;
      products.set(item.name, product);
      current.units += qty;
      current.amount += amount;
    }
    slots.set(slot.key, current);
  }

  const byProduct = [...products.values()].sort((a, b) => b.units - a.units || b.amount - a.amount);
  const bySlot = [...slots.values()].sort((a, b) => a.key.localeCompare(b.key));
  const totalUnits = byProduct.reduce((sum, p) => sum + p.units, 0);
  const totalAmount = byProduct.reduce((sum, p) => sum + p.amount, 0);

  return { byProduct, bySlot, totalUnits, totalAmount };
}
