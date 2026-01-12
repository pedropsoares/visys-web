// src/hooks/useWordsMap.ts
import { useEffect, useState } from 'react';
import { fetchAllWords } from '../services/wordService';
import type { Word } from '../domain/entities';
import { normalizeWord } from '../core/semantic';

type WordsMap = Record<string, Word>;

export function useWordsMap() {
  const [wordsMap, setWordsMap] = useState<WordsMap>({});

  useEffect(() => {
    fetchAllWords().then((words) => {
      const map: WordsMap = {};
      words.forEach((word) => {
        map[normalizeWord(word.text)] = word;
      });
      setWordsMap(map);
    });
  }, []);

  function upsertWord(word: Word) {
    setWordsMap((prev) => ({
      ...prev,
      [normalizeWord(word.text)]: word,
    }));
  }

  return {
    wordsMap,
    upsertWord,
  };
}
