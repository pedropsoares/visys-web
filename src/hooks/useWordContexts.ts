import { useMemo } from 'react';
import type { ContextPhrase } from '../domain/entities';
import { normalizeContext } from '../core/semantic';

export function useWordContexts(
  words: string[],
  contexts: ContextPhrase[],
) {
  const wordTokens = words
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => /[\p{L}\p{M}]/u.test(value));

  const computedMap = useMemo(() => {
    if (!contexts.length || !words.length) return {};

    const map: Record<number, string> = {};

    for (const ctx of contexts) {
      const size = ctx.tokens.length;
      const normalizedTarget = normalizeContext(ctx.normalizedText || ctx.text);

      for (let i = 0; i <= wordTokens.length - size; i++) {
        const slice = wordTokens
          .slice(i, i + size)
          .map((token) => token.value)
          .join(' ');
        const normalizedSlice = normalizeContext(slice);

        if (normalizedSlice === normalizedTarget) {
          for (let j = i; j < i + size; j++) {
            map[wordTokens[j].index] = ctx.id;
          }
        }
      }
    }

    return map;
  }, [contexts, wordTokens, words.length]);

  return computedMap;
}
