import type { Word } from '../domain/entities';
import {
  getAllWords,
  getWord,
  saveWord,
  getWordsByKeys,
} from '../storage/wordRepository';

export async function fetchAllWords(): Promise<Word[]> {
  return getAllWords();
}

export async function fetchWordsByKeys(keys: string[]): Promise<Word[]> {
  return getWordsByKeys(keys);
}

export async function fetchWord(text: string): Promise<Word | null> {
  return getWord(text);
}

export async function persistWord(word: Word): Promise<void> {
  await saveWord(word);
}
