import { useEffect, useState } from 'react';
import type { ContextLink } from '../domain/entities';
import { fetchContextLinksByText } from '../services/contextService';

export function useContextLinks(textId: string | null) {
  const [links, setLinks] = useState<ContextLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!textId) {
      setLinks([]);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    setError(null);
    fetchContextLinksByText(textId)
      .then((data) => {
        if (mounted) setLinks(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to load links'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [textId]);

  return { links, loading, error };
}
