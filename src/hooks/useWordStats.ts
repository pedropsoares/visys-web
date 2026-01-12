import { useEffect, useState } from 'react';
import { fetchAllWords } from '../services/wordService';
import { WordStatus } from '../domain/enums';

export function useWordStats() {
  const [stats, setStats] = useState({
    learned: 0,
    learning: 0,
    notLearned: 0,
  });

  useEffect(() => {
    async function load() {
      const words = await fetchAllWords();

      setStats({
        learned: words.filter((w) => w.status === WordStatus.LEARNED).length,
        learning: words.filter((w) => w.status === WordStatus.LEARNING).length,
        notLearned: words.filter((w) => w.status === WordStatus.NOT_LEARNED)
          .length,
      });
    }

    load();
  }, []);

  return stats;
}
