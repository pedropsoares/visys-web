import { useEffect, useCallback, useState } from 'react';
import { WordStatus } from '../../domain/enums';
import { saveWord, getWord } from '../../storage/wordRepository';
import type { Word } from '../../domain/entities/WordEntry';
import type { ContextSignals } from '../../services/contextSignalsService';

import './WordModal.css';

interface Props {
  word: string;
  signals?: ContextSignals;
  onClose: () => void;
  onSaved: (word: Word) => void;
}

export function WordModal({ word, signals, onClose, onSaved }: Props) {
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const existing = await getWord(word);
      setTranslation(existing?.translation ?? '');
    } finally {
      setLoading(false);
    }
  }, [word]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(status: WordStatus) {
    const data: Word = {
      text: word,
      translation: translation.trim(),
      status,
      updatedAt: Date.now(),
    };
    await saveWord(data);
    onSaved(data);
    onClose();
  }

  function renderReason(reason: string) {
    const separatorIndex = reason.indexOf(': ');
    if (separatorIndex === -1) {
      return reason;
    }
    const label = reason.slice(0, separatorIndex);
    const detail = reason.slice(separatorIndex + 2);
    return (
      <>
        <strong>{label}</strong>: {detail}
      </>
    );
  }

  return (
    <div className="word-modal__overlay" onClick={onClose}>
      <div className="word-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="word-modal__title">{word}</h3>

        {signals && signals.reasons.length > 0 && (
          <div className="word-modal__context-alert">
            <p className="word-modal__context-title">
              Contexto recomendado
            </p>
            <ul className="word-modal__context-reasons">
              {signals.reasons.map((reason) => (
                <li key={reason}>{renderReason(reason)}</li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <p className="word-modal__loading">Loading…</p>
        ) : (
          <textarea
            className="word-modal__input"
            placeholder="Write the meaning in your own words…"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            rows={3}
          />
        )}

        <div className="word-modal__status-group">
          <button className="word-modal__status-group-button" onClick={() => handleSave(WordStatus.NOT_LEARNED)}>🔴</button>
          <button className="word-modal__status-group-button" onClick={() => handleSave(WordStatus.LEARNING)}>🟡</button>
          <button className="word-modal__status-group-button" onClick={() => handleSave(WordStatus.LEARNED)}>🟢</button>
        </div>

        <button className="word-modal__close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
