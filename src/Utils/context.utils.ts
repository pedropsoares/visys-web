/**
 * Normaliza texto para comparação semântica:
 * - lowercase
 * - trim
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
}
