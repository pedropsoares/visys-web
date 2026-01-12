interface props {
    setContextsByIndex: (value: React.SetStateAction<Record<number, string>>) => void
}

export function useContextPhrase() {

  const saveContextPhrase = async (
    setContextsByIndex: (
      value: React.SetStateAction<Record<number, string>>,
    ) => void,
    contextId: string,
    wordIndexes: number[],
  ) => {
    setContextsByIndex((prev) => {
      const updated = { ...prev };
      wordIndexes.forEach((i) => {
        updated[i] = contextId;
      });
      return updated;
    });
  };

  return { saveContextPhrase };
}