type DictionaryResult = {
  term: string;
  found: boolean;
};

const dictionaryCache = new Map<string, boolean>();
const inFlight = new Map<string, Promise<boolean>>();

function normalizeTerm(term: string): string {
  return term.toLowerCase().trim();
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
