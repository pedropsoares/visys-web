import { useCallback, useEffect, useRef, useState } from 'react';
import { WordStatus } from '../../domain/enums';
import { fetchWord, persistWord } from '../../services/wordService';
import type { Word } from '../../domain/entities';
import { TranslationButton } from '../TranslationButton/TranslationButton';

import './WordInPhrase.css';

interface Props {
  word: string;
}

export function WordInPhrase({ word }: Props) {
  const [displayTranslation, setDisplayTranslation] = useState('-');
  const [inputTranslation, setInputTranslation] = useState('');
  const [status, setStatus] = useState<WordStatus>(WordStatus.NOT_LEARNED);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const existing = await fetchWord(word);
      if (existing) {
        setDisplayTranslation(existing.translation ?? '-');
        setInputTranslation(existing.translation ?? '');
        setStatus(existing.status);
        return;
      }
      setDisplayTranslation('-');
      setInputTranslation('');
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isOpen) {
      load();
    }
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);


  async function handleSave() {
    const trimmed = inputTranslation.trim();
    const data: Word = {
      text: word,
      translation: trimmed,
      status: status ?? WordStatus.LEARNING,
      updatedAt: Date.now(),
    };
    await persistWord(data);
    setDisplayTranslation(trimmed || '-');
    setIsOpen(false);
  }

  return (
    <div
      className="phrase-container__word-translation word-in-phrase"
      ref={containerRef}
    >
      <button
        type="button"
        className="word-in-phrase__button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <h4 className="phrase-container__word-translation__title">{word}</h4>
        <p
          translate="no"
          className="phrase-container__word-translation__translation notranslate"
        >
          {displayTranslation}
        </p>
      </button>

      {isOpen && (
        <div className="word-in-phrase__tooltip" role="dialog">
          {loading ? (
            <p className="word-in-phrase__loading">Loading…</p>
          ) : (
            <>
              <textarea
                className="word-in-phrase__input"
                placeholder="Write the meaning in your own words…"
                value={inputTranslation}
                onChange={(e) => setInputTranslation(e.target.value)}
                rows={3}
              />
              <div className="word-in-phrase__actions">
              <TranslationButton
                text={word}
                className="translate-button--word-in-phrase"
                onTranslated={setInputTranslation}
                disabled={displayTranslation !== '-'}
              />
                <button
                  type="button"
                  className="word-in-phrase__save"
                  onClick={handleSave}
                >
                  Salvar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
