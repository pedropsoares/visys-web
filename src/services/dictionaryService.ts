type DictionaryResult = {
  term: string;
  found: boolean;
};

const dictionaryCache = new Map<string, boolean>();
const inFlight = new Map<string, Promise<boolean>>();

function normalizeTerm(term: string): string {
  return term.toLowerCase().trim();
}

function isWordToken(token: string): boolean {
  return /[\p{L}\p{M}]/u.test(token);
}

function getPrevWord(tokens: string[], index: number): string | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (isWordToken(tokens[i])) return tokens[i];
  }
  return null;
}

function getNextWord(tokens: string[], index: number): string | null {
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (isWordToken(tokens[i])) return tokens[i];
  }
  return null;
}

function getNextNextWord(tokens: string[], index: number): string | null {
  let foundNext = false;
  for (let i = index + 1; i < tokens.length; i += 1) {
    if (!isWordToken(tokens[i])) continue;
    if (!foundNext) {
      foundNext = true;
      continue;
    }
    return tokens[i];
  }
  return null;
}

export function buildDictionaryCandidates(
  tokens: string[],
  indexes: number[],
): string[] {
  if (indexes.length === 0) return [];

  const sortedIndexes = [...indexes].sort((a, b) => a - b);

  if (sortedIndexes.length > 1) {
    return [sortedIndexes.map((i) => tokens[i]).join(' ')].filter(Boolean);
  }

  const index = sortedIndexes[0];
  const word = tokens[index];
  if (!word) return [];

  const prev = getPrevWord(tokens, index);
  const next = getNextWord(tokens, index);
  const nextNext = getNextNextWord(tokens, index);

  const candidates = [
    next ? `${word} ${next}` : null,
    next && nextNext ? `${word} ${next} ${nextNext}` : null,
    prev ? `${prev} ${word}` : null,
    prev && next ? `${prev} ${word} ${next}` : null,
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.filter((candidate) => candidate.includes(' '));
}

async function fetchDictionary(term: string): Promise<boolean> {
  const normalized = normalizeTerm(term);
  if (!normalized) return false;
  if (dictionaryCache.has(normalized)) {
    return dictionaryCache.get(normalized) ?? false;
  }
  if (inFlight.has(normalized)) {
    return inFlight.get(normalized) ?? false;
  }

  const request = fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      normalized,
    )}`,
  )
    .then(async (response) => {
      if (!response.ok) {
        dictionaryCache.set(normalized, false);
        return false;
      }
      const data = await response.json();
      const found = Array.isArray(data) && data.length > 0;
      dictionaryCache.set(normalized, found);
      return found;
    })
    .catch(() => {
      dictionaryCache.set(normalized, false);
      return false;
    })
    .finally(() => {
      inFlight.delete(normalized);
    });

  inFlight.set(normalized, request);
  return request;
}

export async function findDictionaryMatch(
  candidates: string[],
): Promise<DictionaryResult | null> {
  for (const candidate of candidates) {
    const normalized = normalizeTerm(candidate);
    if (!normalized) continue;
    const found = await fetchDictionary(normalized);
    if (found) {
      return { term: normalized, found };
    }
  }
  return null;
}
