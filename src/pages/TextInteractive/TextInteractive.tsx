import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { extractWords } from '../../services/textProcessingService';
import { WordModal } from '../../components/WordModal/WordModal';
import { Word } from '../../components/Word/Word';
import { useWordsMap } from '../../hooks/useWordsMap';

import './TextInteractive.css';
import { ContextPhraseModal } from '../../components/ContextPhraseModal/ContextPhraseModal';
import { useWordContexts } from '../../hooks/useWordContex';
import { useContexts } from '../../hooks/useContexts';

export function TextInteractive() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const words = extractWords(state.text);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [contextsByIndex, setContextsByIndex] = useState<
    Record<number, string>
  >({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  function returnHome() {
    navigate('/');
  }
  const { wordsMap, upsertWord } = useWordsMap();
  const contexts = useContexts();

  useWordContexts(words, contexts, setContextsByIndex);

  function handlesSeletionIndex(index: number, SelectedIndexes: number[]) {
    const lastSelected = SelectedIndexes[SelectedIndexes.length - 1];

    return Math.abs(index - lastSelected) > 1;
  }
  function toggleWord(index: number) {
    setSelectedIndexes((prev) => {
      if (handlesSeletionIndex(index, prev)) return prev;

      return prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
    });
  }

  function resetSelection() {
    setIsModalOpen(false);
    setSelectedIndexes([]);
  }

  const selectedWords = selectedIndexes
    .sort((a, b) => a - b)
    .map((i) => words[i]);
  return (
    <div className="page">
      <div className="text-interactive">
        <div className="text-interactive__header">
          <button
            className="text-interactive__button back-button"
            onClick={returnHome}
          >
            Voltar
          </button>
        </div>

        <div className="text-interactive__words">
          {words.map((word, index) => {
            const key = word.toLowerCase();
            return (
              <Word
                key={`${word}-${index}`}
                text={word}
                status={wordsMap[key]?.status}
                isSelected={selectedIndexes.includes(index)}
                contextId={contextsByIndex[index] ?? ''}
                onClick={() => toggleWord(index)}
              />
            );
          })}
        </div>

        <button
          className="text-interactive__button__translate-button"
          disabled={selectedIndexes.length === 0}
          onClick={() => setIsModalOpen(true)}
        >
          Traduzir seleção
        </button>

        {isModalOpen &&
          (selectedIndexes.length === 1 ? (
            <WordModal
              word={selectedWords[0]}
              onClose={resetSelection}
              onSaved={upsertWord}
            />
          ) : (
            <ContextPhraseModal
              phrase={selectedWords}
              wordIndexes={selectedIndexes}
              onClose={resetSelection}
              contextPhaseId={contextsByIndex[selectedIndexes[0]]}
              onSaved={({ contextId, wordIndexes }) => {
                setContextsByIndex((prev) => {
                  const updated = { ...prev };
                  wordIndexes.forEach((i) => {
                    updated[i] = contextId;
                  });
                  return updated;
                });
              }}
            />
          ))}
      </div>
    </div>
  );
}
