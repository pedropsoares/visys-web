export type TranslateResponse = {
  text: string;
  detectedSourceLang?: string;
};

export async function translateText(
  text: string,
  targetLang = 'PT-BR',
): Promise<TranslateResponse> {
  const endpoint = (import.meta.env.VITE_TRANSLATION_ENDPOINT as string | undefined)?.trim();
  if (!endpoint) {
    throw new Error('VITE_TRANSLATION_ENDPOINT is not configured');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, targetLang }),
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  return response.json() as Promise<TranslateResponse>;
}
