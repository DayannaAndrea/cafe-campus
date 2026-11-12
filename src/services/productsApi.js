import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

// Colección de productos en Firestore.
const PRODUCTS_COLLECTION = 'products';

// Emojis predeterminados según la categoría.
function getEmoji(category) {
  const emojis = {
    'Bebidas calientes': '☕',
    'Bebidas frías': '🧃',
    'Panadería': '🥟',
    'Almuerzos': '🍲'
  };

  return emojis[category] || '🍽️';
}

// Convierte los datos de Firestore al formato del frontend.
function mapProduct(id, data) {
  return {
    id,
    name: data.nombre,
    category: data.categoria,
    price: data.precio,
    available: data.disponible,
    emoji: data.emoji || getEmoji(data.categoria)
  };
}

// Escucha los productos en tiempo real.
export function watchProducts(onChange, onError = console.error) {
  let unsubscribeSnapshot = () => {};

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    // Evita mantener dos escuchas simultáneas.
    unsubscribeSnapshot();

    const productsRef = collection(db, PRODUCTS_COLLECTION);

    // Los usuarios autenticados pueden consultar todos.
    // Los visitantes solo consultan productos disponibles.
    const productsQuery = user
      ? productsRef
      : query(productsRef, where('disponible', '==', true));

    unsubscribeSnapshot = onSnapshot(
      productsQuery,
      (snapshot) => {
        const products = snapshot.docs.map((productDoc) =>
          mapProduct(productDoc.id, productDoc.data())
        );

        onChange(products);
      },
      (error) => {
        console.error('Error al consultar productos:', error);
        onError(error);
      }
    );
  });

  // Función para cancelar las suscripciones.
  return () => {
    unsubscribeAuth();
    unsubscribeSnapshot();
  };
}

// Crea o actualiza un producto.
export async function saveProduct(product) {
  const productData = {
    nombre: product.name.trim(),
    categoria: product.category,
    precio: Number(product.price),
    disponible: Boolean(product.available),
    emoji: product.emoji || getEmoji(product.category),
    actualizadoEn: serverTimestamp(),
    actualizadoPor: auth.currentUser?.uid || null
  };

  const productsRef = collection(db, PRODUCTS_COLLECTION);

  if (product.id) {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);

    await updateDoc(productRef, productData);

    return product.id;
  }

  const newProduct = await addDoc(productsRef, productData);

  return newProduct.id;
}
