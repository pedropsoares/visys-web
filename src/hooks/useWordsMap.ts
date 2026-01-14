// src/hooks/useWordsMap.ts
import { useEffect, useMemo, useState } from 'react';
import { fetchAllWords, fetchWordsByKeys } from '../services/wordService';
import type { Word } from '../domain/entities';
import { normalizeWord } from '../core/semantic';

type WordsMap = Record<string, Word>;

function isWordToken(token: string): boolean {
  return /[\p{L}\p{M}]/u.test(token);
}

export function useWordsMap(tokens: string[] = []) {
  const [wordsMap, setWordsMap] = useState<WordsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const wordKeys = useMemo(() => {
    if (!tokens.length) return [];
    return Array.from(
      new Set(
        tokens.filter(isWordToken).map((token) => normalizeWord(token)),
      ),
    );
  }, [tokens]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    if (tokens.length === 0 || wordKeys.length === 0) {
      setWordsMap({});
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const request =
      wordKeys.length > 0 ? fetchWordsByKeys(wordKeys) : fetchAllWords();

    request
      .then((words) => {
        if (!isMounted) return;
        const map: WordsMap = {};
        words.forEach((word) => {
          map[normalizeWord(word.text)] = word;
        });
        setWordsMap(map);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load words'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [wordKeys]);

  function upsertWord(word: Word) {
    setWordsMap((prev) => ({
      ...prev,
      [normalizeWord(word.text)]: word,
    }));
  }

  return {
    wordsMap,
    upsertWord,
    loading,
    error,
  };
}
