import { useMemo } from 'react';
import type { ContextLink, ContextPhrase } from '../domain/entities';
import { normalizeWord } from '../core/semantic';

export function useWordContexts(
  words: string[],
  contexts: ContextPhrase[],
  links: ContextLink[] = [],
) {
  const wordTokens = words
    .map((value, index) => ({
      value,
      index,
      normalized: normalizeWord(value),
    }))
    .filter(({ value }) => /[\p{L}\p{M}]/u.test(value));

  const computedMap = useMemo(() => {
    if (!words.length) return {};

    const map: Record<number, string> = {};
    if (links.length) {
      const normalizedTokens = wordTokens.map((token) => token.normalized);

      links.forEach((link) => {
        const linkTokens =
          link.normalizedTokens?.length
            ? link.normalizedTokens
            : link.wordIndexes
                .map((index) => normalizedTokens[index])
                .filter(Boolean);

        if (linkTokens.length === 0) return;

        const minIndex = Math.min(...link.wordIndexes);
        const maxIndex = Math.max(...link.wordIndexes);
        const expectedCount = link.tokenCount || linkTokens.length;
        const hasContiguousIndexes =
          link.wordIndexes.length > 0 &&
          maxIndex - minIndex + 1 === expectedCount;

        if (hasContiguousIndexes) {
          let matches = true;
          for (let i = 0; i < linkTokens.length; i += 1) {
            if (normalizedTokens[minIndex + i] !== linkTokens[i]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            for (let i = minIndex; i < minIndex + expectedCount; i += 1) {
              if (i >= 0 && i < words.length) {
                map[i] = link.contextId;
              }
            }
            return;
          }
        }

        for (let i = 0; i <= normalizedTokens.length - linkTokens.length; i++) {
          let matches = true;
          for (let j = 0; j < linkTokens.length; j++) {
            if (normalizedTokens[i + j] !== linkTokens[j]) {
              matches = false;
              break;
            }
          }
          if (!matches) continue;

          for (let j = i; j < i + linkTokens.length; j++) {
            map[wordTokens[j].index] = link.contextId;
          }
          break;
        }
      });
      return map;
    }

    if (!contexts.length) return map;
    const normalizedTokens = wordTokens.map((token) => token.normalized);

    for (const ctx of contexts) {
      const target = ctx.normalizedTokens?.length
        ? ctx.normalizedTokens
        : ctx.tokens
            .filter((token) => /[\p{L}\p{M}]/u.test(token))
            .map((token) => normalizeWord(token));

      if (target.length === 0) continue;

      for (let i = 0; i <= normalizedTokens.length - target.length; i++) {
        let matches = true;
        for (let j = 0; j < target.length; j++) {
          if (normalizedTokens[i + j] !== target[j]) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;

        for (let j = i; j < i + target.length; j++) {
          map[wordTokens[j].index] = ctx.id;
        }
      }
    }

    return map;
  }, [contexts, links, wordTokens, words.length]);

  return computedMap;
}
