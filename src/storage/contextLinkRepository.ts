import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ContextLink } from '../domain/entities';

const COLLECTION = collection(db, 'context_links');

export async function saveContextLink(link: ContextLink): Promise<void> {
  const wordIndexKey = link.wordIndexes.join('-');
  const id = `${link.textId}_${link.contextId}_${wordIndexKey}`;
  await setDoc(doc(COLLECTION, id), link, { merge: true });
}

export async function getContextLinksByText(
  textId: string,
): Promise<ContextLink[]> {
  const q = query(COLLECTION, where('textId', '==', textId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ContextLink);
}
