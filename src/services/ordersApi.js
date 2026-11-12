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
  serverTimestamp
} from 'firebase/firestore';

import { auth, db } from '../firebase';

const ORDERS_COLLECTION = 'orders';

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
    payment: data.payment || null
  };
}

// Consulta todos los pedidos del personal autenticado.
export async function getOrders() {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const ordersQuery = query(ordersRef, orderBy('created', 'desc'));
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDoc) =>
    mapOrder(orderDoc.id, orderDoc.data())
  );
}

// Escucha los cambios de pedidos en tiempo real.
export function watchOrders(onChange, onError = console.error) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const ordersQuery = query(ordersRef, orderBy('created', 'desc'));

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((orderDoc) =>
        mapOrder(orderDoc.id, orderDoc.data())
      );

      onChange(orders);
    },
    (error) => {
      console.error('Error al escuchar pedidos:', error);
      onError(error);
    }
  );
}

// Crea un pedido de mostrador o anticipado.
export async function createOrder({
  customer,
  items,
  kind = 'mostrador',
  pickup = null
}) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('El pedido debe contener productos.');
  }

  // Consultar los precios actuales directamente en Firestore.
  const verifiedItems = await Promise.all(
    items.map(async (item) => {
      const productRef = doc(db, 'products', item.id);
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
        throw new Error('Cantidad de producto inválida.');
      }

      return {
        id: productSnapshot.id,
        name: product.nombre,
        price: product.precio,
        qty: quantity
      };
    })
  );

  const total = verifiedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const trackingId = generateTrackingId();
  const ticket = generateTicket();

  const order = {
    ticket,
    trackingId,
    customer: customer?.trim() || 'Cliente en caja',
    kind,
    pickup,
    items: verifiedItems,
    total,
    status: 'recibido',
    created: serverTimestamp(),
    payment: null,
    createdBy: auth.currentUser?.uid || null
  };

  // El identificador privado también funciona como ID del documento.
  const orderRef = doc(db, ORDERS_COLLECTION, trackingId);

  await setDoc(orderRef, order);

  return {
    ...order,
    id: trackingId,
    created: new Date().toISOString()
  };
}

// Actualiza el estado u otros datos permitidos del pedido.
export async function updateOrder(id, patch) {
  const orderRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(orderRef, patch);
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
  onError = console.error
) {
  const orderRef = doc(db, ORDERS_COLLECTION, trackingId);

  return onSnapshot(
    orderRef,
    (snapshot) => {
      onChange(
        snapshot.exists()
          ? mapOrder(snapshot.id, snapshot.data())
          : null
      );
    },
    onError
  );
}
