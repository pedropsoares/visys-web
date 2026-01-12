import type { WordStatus } from "../enums";

export interface ContextPhrase {
  id: string;
  text: string;
  normalizedText: string;
  translation: string;
  tokens: string[];
  tokenCount: number;
  status: WordStatus;
}

