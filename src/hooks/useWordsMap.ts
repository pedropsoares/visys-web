// src/hooks/useWordsMap.ts
import { useEffect, useState } from 'react';
import { fetchAllWords } from '../services/wordService';
import type { Word } from '../domain/entities';

type WordsMap = Record<string, Word>;

function normalizeKey(text: string) {
  return text.toLowerCase();
}

export function useWordsMap() {
  const [wordsMap, setWordsMap] = useState<WordsMap>({});

  useEffect(() => {
    fetchAllWords().then((words) => {
      const map: WordsMap = {};
      words.forEach((word) => {
        map[normalizeKey(word.text)] = word;
      });
      setWordsMap(map);
    });
  }, []);

  function upsertWord(word: Word) {
    setWordsMap((prev) => ({
      ...prev,
      [normalizeKey(word.text)]: word,
    }));
  }

  return {
    wordsMap,
    upsertWord,
  };
}
