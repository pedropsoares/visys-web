import { useMemo } from 'react';
import { WordStatus } from '../../domain/enums';

import './Word.css';

interface Props {
  text: string;
  status?: WordStatus;
  isSelected?: boolean;
  onClick: () => void;
}

function isPunctuation(text: string): boolean {
  return /^[\p{P}\p{S}]+$/u.test(text);
}

export function Word({ text, status, isSelected, onClick }: Props) {
  const punctuation = isPunctuation(text);

  const word = useMemo(() => {
    return (
      <span
        className={`word
          ${punctuation ? 'word__punctuation' : status ? `word--${status}` : ''}
          ${isSelected ? 'word--selected' : ''}
        `.replace(/\s+/g, ' ').trim()}
        onClick={punctuation ? undefined : onClick}
      >
        {text}
      </span>
    );
  }, [text, status, isSelected, onClick, punctuation]);

  return word;
}
