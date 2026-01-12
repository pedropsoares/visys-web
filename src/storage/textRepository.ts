import { collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { TextEntry } from '../domain/entities';

const COLLECTION = collection(db, 'texts');
const ACTIVE_ID = 'active';

export async function saveActiveText(text: TextEntry): Promise<void> {
  const ref = doc(COLLECTION, ACTIVE_ID);
  await setDoc(ref, text);
}

export async function getActiveText(): Promise<TextEntry | null> {
  const ref = doc(COLLECTION, ACTIVE_ID);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as TextEntry) : null;
}

export async function clearActiveText(): Promise<void> {
  const ref = doc(COLLECTION, ACTIVE_ID);
  await deleteDoc(ref);
}
