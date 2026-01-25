import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
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

export async function getContextsByTokens(
  tokens: string[],
): Promise<ContextPhrase[]> {
  const uniqueTokens = Array.from(new Set(tokens.filter(Boolean)));
  if (uniqueTokens.length === 0) return [];

  const chunkSize = 10;
  const results: ContextPhrase[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < uniqueTokens.length; i += chunkSize) {
    const chunk = uniqueTokens.slice(i, i + chunkSize);
    try {
      const q = query(COLLECTION, where('normalizedTokens', 'array-contains-any', chunk));
      const snap = await getDocs(q);
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data() as ContextPhrase;
        if (!seen.has(data.id)) {
          seen.add(data.id);
          results.push(data);
        }
      });
    } catch (error) {
      console.error('getContextsByTokens failed', error);
    }
  }

  if (results.length === 0) {
    return getAllContexts();
  }

  const legacyContexts = await getAllContexts();

  legacyContexts.forEach((context) => {
    if (!context.normalizedTokens?.length && !seen.has(context.id)) {
      seen.add(context.id);
      results.push(context);
    }
  });

  return results;
}
