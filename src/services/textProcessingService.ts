export function extractWords(text: string): string[] {
  if (!text) return [];

  return (
    text.match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*|[^\p{L}\p{M}\s]/gu) ?? []
  );
}
