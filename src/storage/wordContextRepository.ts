import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'wordContexts';

export async function linkWordToContext(
  word: string,
  contextId: string,
): Promise<void> {
  const id = `${word.toLowerCase()}_${contextId}`;

  await setDoc(doc(db, COLLECTION, id), {
    word: word.toLowerCase(),
    contextId,
  });
}

export async function getContextsByWord(word: string): Promise<string[]> {
  const q = query(
    collection(db, COLLECTION),
    where('word', '==', word.toLowerCase()),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data().contextId);
}
