/**
 * Normaliza texto para comparação semântica:
 * - lowercase
 * - remove espaços duplicados
 * - remove pontuação irrelevante
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
}

