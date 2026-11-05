// Acceso a la colección products de Firestore. Refs CAF-02.
import {
  addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const coleccion = collection(db, 'products');

// Escucha el menú en tiempo real. Devuelve la función para dejar de escuchar.
export function escucharProductos(onCambio, onError) {
  const q = query(coleccion, orderBy('nombre'));
  return onSnapshot(
    q,
    (snap) => onCambio(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// Las reglas de Firestore rechazan estas escrituras si quien las hace no es la administradora (RN-A5).
export function crearProducto(datos, uid) {
  return addDoc(coleccion, { ...datos, actualizadoPor: uid, actualizadoEn: serverTimestamp() });
}

export function actualizarProducto(id, datos, uid) {
  return updateDoc(doc(db, 'products', id), { ...datos, actualizadoPor: uid, actualizadoEn: serverTimestamp() });
}
