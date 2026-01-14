import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeWord } from '../core/semantic';
import type { Word } from '../domain/entities';

const wordsCollection = collection(db, 'words');

const wordCache = new Map<string, Word | null>();

export async function saveWord(word: Word) {
  const key = normalizeWord(word.text);

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
  const key = normalizeWord(text);

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
    list.forEach((w) => wordCache.set(normalizeWord(w.text), w));
    return list;
  } catch (error) {
    console.error('getAllWords failed', error);
    return [];
  }
}

export async function getWordsByKeys(keys: string[]): Promise<Word[]> {
  const normalizedKeys = Array.from(
    new Set(keys.map((key) => normalizeWord(key)).filter(Boolean)),
  );
  if (normalizedKeys.length === 0) return [];

  const cachedWords: Word[] = [];
  const missingKeys: string[] = [];

  normalizedKeys.forEach((key) => {
    if (wordCache.has(key)) {
      const cached = wordCache.get(key);
      if (cached) cachedWords.push(cached);
    } else {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length === 0) {
    return cachedWords;
  }

  const results: Word[] = [...cachedWords];
  const chunkSize = 10;
  for (let i = 0; i < missingKeys.length; i += chunkSize) {
    const chunk = missingKeys.slice(i, i + chunkSize);
    try {
      const q = query(wordsCollection, where(documentId(), 'in', chunk));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data() as Word);
      const foundKeys = new Set<string>();
      list.forEach((word) => {
        const key = normalizeWord(word.text);
        foundKeys.add(key);
        wordCache.set(key, word);
      });
      chunk.forEach((key) => {
        if (!foundKeys.has(key)) {
          wordCache.set(key, null);
        }
      });
      results.push(...list);
    } catch (error) {
      console.error('getWordsByKeys failed', error);
    }
  }

  return results;
}
