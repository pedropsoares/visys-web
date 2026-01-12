import { useEffect, useState } from 'react';
import type { TextEntry } from '../domain/entities';
import { fetchActiveText } from '../services/textService';

export function useActiveText() {
  const [activeText, setActiveText] = useState<TextEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchActiveText()
      .then((text) => {
        if (mounted) setActiveText(text);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { activeText, loading, setActiveText };
}
