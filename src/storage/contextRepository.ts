import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ContextPhrase } from '../domain/entities';

const COLLECTION = collection(db, 'contexts');

export async function saveContextPhrase(context: ContextPhrase): Promise<void> {
  const ref = doc(COLLECTION, context.id);
  await setDoc(ref, context);
}

export async function getContext(id: string): Promise<ContextPhrase | null> {
  const ref = doc(COLLECTION, id);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() as ContextPhrase) : null;
}

export async function getAllContexts(): Promise<ContextPhrase[]> {
  const snap = await getDocs(collection(db, 'contexts'));
  return snap.docs.map((d) => d.data() as ContextPhrase);
}