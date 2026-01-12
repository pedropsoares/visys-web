import { useEffect, useState } from 'react';
import { getAllContexts } from '../storage/contextRepository';
import type { ContextPhrase } from '../domain/entities';

export function useContexts() {
  const [contexts, setContexts] = useState<ContextPhrase[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    getAllContexts().then((data) => {
      setContexts(data);
      setLoaded(true);
    });
  }, [loaded]);

  return contexts;
}
