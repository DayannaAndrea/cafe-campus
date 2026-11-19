import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const ORDERS_COLLECTION = "orders";

// RN-A3: los pedidos anticipados se recogen en franjas de 15 minutos,
// con máximo 10 pedidos por franja y al menos 15 minutos de anticipación.
const SLOTS_COLLECTION = "slots";
const SLOT_MINUTES = 15;
const SLOT_CAPACITY = 10;
const MIN_ADVANCE_MINUTES = 15;

// Inicio de la franja de 15 minutos a la que pertenece una hora.
export function slotStart(date) {
  const start = new Date(date);
  start.setSeconds(0, 0);
  start.setMinutes(Math.floor(start.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES);
  return start;
}

const slotId = (start) => start.toISOString().slice(0, 16);

export const formatSlot = (date) =>
  new Date(date).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });

// Error de franja llena: trae la siguiente franja con cupo para ofrecerla al cliente.
export class SlotFullError extends Error {
  constructor(full, suggested) {
    super(
      `La franja de las ${formatSlot(full)} ya tiene ${SLOT_CAPACITY} pedidos. ` +
        `Te ofrecemos la de las ${formatSlot(suggested)}.`,
    );
    this.name = "SlotFullError";
    this.suggested = suggested;
  }
}

async function nextFreeSlot(from) {
  let start = new Date(from);
  for (let i = 0; i < 16; i += 1) {
    start = new Date(start.getTime() + SLOT_MINUTES * 60000);
    const snapshot = await getDoc(doc(db, SLOTS_COLLECTION, slotId(start)));
    if (!snapshot.exists() || snapshot.data().count < SLOT_CAPACITY) return start;
  }
  return start;
}

// Genera un identificador aleatorio para el seguimiento privado.
function generateTrackingId() {
  return crypto.randomUUID();
}

// Genera un número de turno de 8 dígitos.
function generateTicket() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

// Convierte los datos de Firestore al formato utilizado por el frontend.
function mapOrder(id, data) {
  return {
    id,
    ticket: data.ticket,
    trackingId: data.trackingId,
    customer: data.customer,
    kind: data.kind,
    pickup: data.pickup || null,
    items: data.items || [],
    total: data.total || 0,
    status: data.status,
    created: data.created?.toDate
      ? data.created.toDate().toISOString()
      : data.created,
    payment: data.payment || null,
  };
}

// Consulta todos los pedidos del personal autenticado.
export async function getOrders() {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const ordersQuery = query(ordersRef, orderBy("created", "desc"));
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDoc) =>
    mapOrder(orderDoc.id, orderDoc.data()),
  );
}

// Escucha los cambios de pedidos en tiempo real.
export function watchOrders(onChange, onError = console.error) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const ordersQuery = query(ordersRef, orderBy("created", "desc"));

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((orderDoc) =>
        mapOrder(orderDoc.id, orderDoc.data()),
      );

      onChange(orders);
    },
    (error) => {
      console.error("Error al escuchar pedidos:", error);
      onError(error);
    },
  );
}

// Crea un pedido de mostrador o anticipado.
export async function createOrder({
  customer,
  items,
  kind = "mostrador",
  pickup = null,
}) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("El pedido debe contener productos.");
  }

  // Consultar los precios actuales directamente en Firestore.
  const verifiedItems = await Promise.all(
    items.map(async (item) => {
      const productRef = doc(db, "products", item.id);
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        throw new Error(`El producto ${item.name} ya no existe.`);
      }

      const product = productSnapshot.data();

      if (!product.disponible) {
        throw new Error(`El producto ${product.nombre} no está disponible.`);
      }

      const quantity = Number(item.qty);

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        throw new Error("Cantidad de producto inválida.");
      }

      return {
        id: productSnapshot.id,
        name: product.nombre,
        price: product.precio,
        qty: quantity,
      };
    }),
  );

  const total = verifiedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const trackingId = generateTrackingId();
  const ticket = generateTicket();

  const order = {
    ticket,
    trackingId,
    customer: customer?.trim() || "Cliente en caja",
    kind,
    pickup,
    items: verifiedItems,
    total,
    status: "recibido",
    created: serverTimestamp(),
    payment: null,
    createdBy: auth.currentUser?.uid || null,
  };

  // El identificador privado también funciona como ID del documento.
  const orderRef = doc(db, ORDERS_COLLECTION, trackingId);

  if (kind === "anticipado" && pickup) {
    const pickupDate = new Date(pickup);
    if (pickupDate.getTime() < Date.now() + MIN_ADVANCE_MINUTES * 60000) {
      throw new Error(
        `La hora de recogida debe ser al menos ${MIN_ADVANCE_MINUTES} minutos después de ahora.`,
      );
    }

    // El cupo de la franja y el pedido se guardan juntos, para que dos clientes
    // no ocupen al mismo tiempo el último cupo (RN-A3).
    const start = slotStart(pickupDate);
    const slotRef = doc(db, SLOTS_COLLECTION, slotId(start));
    let full = false;
    await runTransaction(db, async (transaction) => {
      const slot = await transaction.get(slotRef);
      const count = slot.exists() ? slot.data().count : 0;
      if (count >= SLOT_CAPACITY) {
        full = true;
        return;
      }
      transaction.set(slotRef, { count: count + 1 });
      transaction.set(orderRef, order);
    });
    if (full) throw new SlotFullError(start, await nextFreeSlot(start));
  } else {
    await setDoc(orderRef, order);
  }

  return {
    ...order,
    id: trackingId,
    created: new Date().toISOString(),
  };
}

// Actualiza el estado u otros datos permitidos del pedido.
export async function updateOrder(id, patch) {
  const orderRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(orderRef, patch);
}

// Registra el pago y entrega el pedido en una sola transacción.
export async function registerOrderPayment(id, method) {
  const validMethods = ["efectivo", "transferencia"];

  if (!validMethods.includes(method)) {
    throw new Error("Método de pago no válido.");
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Debes iniciar sesión para registrar el pago.");
  }

  const orderRef = doc(db, ORDERS_COLLECTION, id);

  await runTransaction(db, async (transaction) => {
    const orderSnapshot = await transaction.get(orderRef);

    if (!orderSnapshot.exists()) {
      throw new Error("El pedido no existe.");
    }

    const order = orderSnapshot.data();

    if (order.status !== "listo") {
      throw new Error("Solo puedes cobrar pedidos que estén listos.");
    }

    if (order.payment !== null) {
      throw new Error("Este pedido ya tiene un pago registrado.");
    }

    if (typeof order.total !== "number" || order.total <= 0) {
      throw new Error("El total del pedido no es válido.");
    }

    const payment = {
      method,
      amount: order.total,
      paidAt: serverTimestamp(),
      paidBy: currentUser.uid,
    };

    transaction.update(orderRef, {
      status: "entregado",
      payment,
    });
  });

  return true;
}

// Consulta un pedido mediante su identificador privado.
export async function getOrderByTrackingId(trackingId) {
  const orderRef = doc(db, ORDERS_COLLECTION, trackingId);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapOrder(snapshot.id, snapshot.data());
}

// Escucha un pedido individual en tiempo real.
export function watchOrderByTrackingId(
  trackingId,
  onChange,
  onError = console.error,
) {
  const orderRef = doc(db, ORDERS_COLLECTION, trackingId);

  return onSnapshot(
    orderRef,
    (snapshot) => {
      onChange(
        snapshot.exists() ? mapOrder(snapshot.id, snapshot.data()) : null,
      );
    },
    onError,
  );
}
