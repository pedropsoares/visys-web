export type TranslationResponse = {
  responseData?: { translatedText?: string }
  matches?: Array<{ translation?: string }>
}

//TO-DO: Handle API limits and errors more gracefully
export async function fetchMeaning(word: string): Promise<string> {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      word,
    )}&langpair=en|pt-BR`,
  )

  if (!res.ok) throw new Error('Translation request failed')

  const data: TranslationResponse = await res.json()

  const rd = data.responseData?.translatedText
  if (rd) return rd

  const m = data.matches?.[0]?.translation
  if (m) return m

  throw new Error('No translation found')
}
