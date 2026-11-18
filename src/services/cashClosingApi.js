import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const ORDERS_COLLECTION = "orders";
const CLOSINGS_COLLECTION = "cashClosings";

// Construye el rango del día según la hora de Colombia.
function getDateRange(date) {
  const start = new Date(`${date}T00:00:00-05:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

// Consulta únicamente los pedidos que tienen un pago registrado
// dentro del día seleccionado.
export async function getDailyPayments(date) {
  const { start, end } = getDateRange(date);

  const paymentsQuery = query(
    collection(db, ORDERS_COLLECTION),
    where("payment.paidAt", ">=", start),
    where("payment.paidAt", "<", end),
  );

  const snapshot = await getDocs(paymentsQuery);

  const orders = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  const cashTotal = orders
    .filter((order) => order.payment?.method === "efectivo")
    .reduce((sum, order) => sum + order.payment.amount, 0);

  const transferTotal = orders
    .filter((order) => order.payment?.method === "transferencia")
    .reduce((sum, order) => sum + order.payment.amount, 0);

  return {
    date,
    cashTotal,
    transferTotal,
    grandTotal: cashTotal + transferTotal,
    ordersCount: orders.length,
    orders,
  };
}

// Consulta si ya existe un cierre para la fecha.
export async function getCashClosing(date) {
  const closingRef = doc(db, CLOSINGS_COLLECTION, date);
  const snapshot = await getDoc(closingRef);

  return snapshot.exists() ? snapshot.data() : null;
}

// Registra el cierre una sola vez por fecha.
export async function createCashClosing(summary) {
  if (!auth.currentUser) {
    throw new Error("Debes iniciar sesión para registrar el cierre.");
  }

  const closingRef = doc(db, CLOSINGS_COLLECTION, summary.date);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(closingRef);

    if (existing.exists()) {
      throw new Error("Ya existe un cierre registrado para esta fecha.");
    }

    transaction.set(closingRef, {
      date: summary.date,
      cashTotal: summary.cashTotal,
      transferTotal: summary.transferTotal,
      grandTotal: summary.grandTotal,
      ordersCount: summary.ordersCount,
      closedAt: serverTimestamp(),
      closedBy: auth.currentUser.uid,
    });
  });
}
