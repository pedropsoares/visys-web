import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Word } from '../domain/entities';

const wordsCollection = collection(db, 'words');

const wordCache = new Map<string, Word | null>();

function normalizeKey(text: string) {
  return text.toLowerCase();
}

export async function saveWord(word: Word) {
  const key = normalizeKey(word.text);

  const safeWord: Word = {
    ...word,
    translation: word.translation ?? '',
  };

  try {
    await setDoc(doc(wordsCollection, key), safeWord);
    wordCache.set(key, safeWord);
  } catch (error) {
    console.error('saveWord failed', error);
    throw error;
  }
}

export async function getWord(text: string): Promise<Word | null> {
  const key = normalizeKey(text);

  if (wordCache.has(key)) {
    return wordCache.get(key) ?? null;
  }

  try {
    const snap = await getDoc(doc(wordsCollection, key));
    const value = snap.exists() ? (snap.data() as Word) : null;
    wordCache.set(key, value);
    return value;
  } catch (error) {
    console.error('getWord failed', error);
    return null;
  }
}

export async function getAllWords(): Promise<Word[]> {
  try {
    const snap = await getDocs(wordsCollection);
    const list = snap.docs.map((d) => d.data() as Word);
    list.forEach((w) => wordCache.set(normalizeKey(w.text), w));
    return list;
  } catch (error) {
    console.error('getAllWords failed', error);
    return [];
  }
}
