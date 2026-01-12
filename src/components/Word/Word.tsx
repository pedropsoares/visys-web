import { useMemo } from 'react';
import { WordStatus } from '../../domain/enums';

import './Word.css';

interface Props {
  text: string;
  status?: WordStatus;
  isSelected?: boolean;
  contextId: string;
  onClick: () => void;
}

function isPunctuation(text: string): boolean {
  return /^[\p{P}\p{S}]+$/u.test(text);
}

export function Word({ text, status, isSelected, contextId, onClick }: Props) {
  const punctuation = isPunctuation(text);

  const word = useMemo(() => {
    return (
      <>
        <span
          className={`word
          ${punctuation ? 'word__punctuation' : status ? `word--${status}` : ''}
          ${isSelected ? 'word--selected' : ''}
          ${contextId && !punctuation ? 'word-context' : ''}`
            .replace(/\s+/g, ' ')
            .trim()}
          onClick={punctuation ? undefined : onClick}
        >
          {text}
        </span>
        <div className="context-box" />
      </>
    );
  }, [text, status, isSelected, contextId, onClick, punctuation]);

  return word;
}
