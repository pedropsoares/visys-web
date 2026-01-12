import type { Word } from '../domain/entities';
import { getAllWords, getWord, saveWord } from '../storage/wordRepository';

export async function fetchAllWords(): Promise<Word[]> {
  return getAllWords();
}

export async function fetchWord(text: string): Promise<Word | null> {
  return getWord(text);
}

export async function persistWord(word: Word): Promise<void> {
  await saveWord(word);
}
