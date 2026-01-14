import type { WordStatus } from "../enums";

export interface ContextPhrase {
  id: string;
  text: string;
  normalizedText: string;
  normalizedTokens?: string[];
  translation: string;
  tokens: string[];
  tokenCount: number;
  status: WordStatus;
}
