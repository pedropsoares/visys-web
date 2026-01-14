export type TranslateResponse = {
  text: string;
  detectedSourceLang?: string;
};

export async function translateText(
  text: string,
  targetLang = 'PT-BR',
): Promise<TranslateResponse> {
  const endpoint = (
    import.meta.env.VITE_TRANSLATION_ENDPOINT as string | undefined
  )?.trim();
  if (!endpoint) {
    throw new Error('VITE_TRANSLATION_ENDPOINT is not configured');
  }

  const maxAttempts = 3;
  const baseDelayMs = 300;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Retryable: ${response.status}`);
        }
        throw new Error(`Translation failed: ${response.status}`);
      }

      return response.json() as Promise<TranslateResponse>;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('Translation failed');
      if (attempt >= maxAttempts - 1) break;
      const delay = baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error('Translation failed');
}
