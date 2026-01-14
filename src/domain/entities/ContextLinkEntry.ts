export interface ContextLink {
  textId: string;
  contextId: string;
  wordIndexes: number[];
  normalizedTokens: string[];
  tokenCount: number;
  updatedAt: number;
}
