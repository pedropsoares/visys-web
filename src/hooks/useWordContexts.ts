import { useEffect, useMemo } from 'react';
import type { ContextPhrase } from '../domain/entities';
import { normalizeText } from '../utils/context.utils';

export function useWordContexts(
  words: string[],
  contexts: ContextPhrase[],
  setContextsByIndex: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >,
) {
  const normalizedWords = words.map((w) => normalizeText(w)).filter(Boolean);

  const computedMap = useMemo(() => {
    if (!contexts.length || !words.length) return {};

    const map: Record<number, string> = {};

    for (const ctx of contexts) {
      const size = ctx.tokens.length;



      for (let i = 0; i <= normalizedWords.length - size; i++) {
        const slice = normalizedWords.slice(i, i + size).join(' ');

        if (slice === normalizeText(ctx.normalizedText)) {
          for (let j = i; j < i + size; j++) {
            map[j] = ctx.id;
          }
        }
      }
    }

    return map;
  }, [contexts, normalizedWords, words.length]);

  useEffect(() => {
    setContextsByIndex((prev) => {
      const merged = { ...computedMap, ...prev };

      const same =
        Object.keys(prev).length === Object.keys(merged).length &&
        Object.keys(prev).every((k) => prev[Number(k)] === merged[Number(k)]);

      return same ? prev : merged;
    });
  }, [computedMap, setContextsByIndex]);
}
