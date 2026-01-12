import { useEffect, useState } from 'react';
import { fetchAllContexts } from '../services/contextService';
import type { ContextPhrase } from '../domain/entities';

export function useContexts() {
  const [contexts, setContexts] = useState<ContextPhrase[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    fetchAllContexts().then((data) => {
      setContexts(data);
      setLoaded(true);
    });
  }, [loaded]);

  return contexts;
}
