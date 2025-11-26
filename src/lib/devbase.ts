import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "./firebase";

type FirestoreFilters = { [key: string]: [WhereFilterOp, any] | any };

async function firestoreListEntities(collectionName: string, filters: FirestoreFilters = {}) {
  const colRef = collection(db, collectionName);
  let q: any = colRef;

  const entries = Object.entries(filters || {});
  if (entries.length > 0) {
    const whereClauses = entries.map(([field, value]) => {
      if (Array.isArray(value)) {
        return where(field, value[0], value[1]);
      }
      return where(field, "==", value);
    });
    q = query(colRef, ...whereClauses);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as any[];
}

async function firestoreGetEntity(collectionName: string, id: string) {
  if (!id) return null;
  const docRef = doc(db, collectionName, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as any;
}

async function firestoreCreateEntity(collectionName: string, data: any) {
  const colRef = collection(db, collectionName);
  // Firestore doesn't like undefined values
  const cleanedData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
  const docRef = await addDoc(colRef, cleanedData);
  return { id: docRef.id, ...cleanedData } as any;
}

async function firestoreUpdateEntity(collectionName: string, id: string, updates: any) {
  if (!id) throw new Error("Document ID is required for update.");
  const docRef = doc(db, collectionName, id);
  // Firestore doesn't like undefined values
  const cleanedUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
  await updateDoc(docRef, cleanedUpdates);
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as any;
}

async function firestoreDeleteEntity(collectionName: string, id: string) {
  if (!id) throw new Error("Document ID is required for deletion.");
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export const devbaseClient = {
  listEntities: (collectionName: string, filters?: FirestoreFilters) =>
    firestoreListEntities(collectionName, filters),
  getEntity: (collectionName: string, id: string) =>
    firestoreGetEntity(collectionName, id),
  createEntity: (collectionName: string, data: any) =>
    firestoreCreateEntity(collectionName, data),
  updateEntity: (collectionName: string, id: string, updates: any) =>
    firestoreUpdateEntity(collectionName, id, updates),
  deleteEntity: (collectionName: string, id: string) =>
    firestoreDeleteEntity(collectionName, id),
};
