import { tokenize } from '../core/semantic';

export function extractWords(text: string): string[] {
  if (!text) return [];
  return tokenize(text)
    .filter((token) => token.kind !== 'SPACE')
    .map((token) => token.value);
}
