import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import { extractWords } from '../../services/textProcessingService';
import { WordModal } from '../../components/WordModal/WordModal';
import { Word } from '../../components/Word';
import { useWordsMap } from '../../hooks/useWordsMap';

import './TextInteractive.css';
import { ContextPhraseModal } from '../../components/ContextPhraseModal/ContextPhraseModal';
import { useWordContexts } from '../../hooks/useWordContexts';
import { useContexts } from '../../hooks/useContexts';
import {
  analyzeSelectionSignals,
  analyzeWordSignals,
} from '../../services/contextSignalsService';
import {
  buildDictionaryCandidates,
  findDictionaryMatch,
} from '../../services/dictionaryService';

export function TextInteractive() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const words = extractWords(state.text);

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [contextsByIndex, setContextsByIndex] = useState<
    Record<number, string>
  >({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dictionaryMatch, setDictionaryMatch] = useState<string | null>(null);
  function returnHome() {
    navigate('/');
  }
  const { wordsMap, upsertWord } = useWordsMap();
  const contexts = useContexts();

  useWordContexts(words, contexts, setContextsByIndex);

  const wordSignals = useMemo(
    () => words.map((_, index) => analyzeWordSignals(words, index)),
    [words],
  );

  const baseSelectionSignals = useMemo(
    () => analyzeSelectionSignals(words, selectedIndexes),
    [words, selectedIndexes],
  );

  useEffect(() => {
    let isActive = true;
    async function loadDictionaryMatch() {
      if (selectedIndexes.length === 0) {
        if (isActive) setDictionaryMatch(null);
        return;
      }
      const candidates = buildDictionaryCandidates(words, selectedIndexes);
      if (candidates.length === 0) {
        if (isActive) setDictionaryMatch(null);
        return;
      }
      const match = await findDictionaryMatch(candidates);
      if (isActive) {
        setDictionaryMatch(match?.term ?? null);
      }
    }
    loadDictionaryMatch();
    return () => {
      isActive = false;
    };
  }, [words, selectedIndexes]);

  const selectionSignals = useMemo(() => {
    if (!dictionaryMatch) return baseSelectionSignals;
    const reasons = [
      ...baseSelectionSignals.reasons,
      `expressão encontrada no dicionário: "${dictionaryMatch}"`,
    ];
    return {
      ...baseSelectionSignals,
      isIdiomaticCandidate: true,
      recommendation: 'context' as const,
      ambiguityScore: Math.max(baseSelectionSignals.ambiguityScore, 3),
      reasons: Array.from(new Set(reasons)),
    };
  }, [baseSelectionSignals, dictionaryMatch]);

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
            const signal = wordSignals[index];
            return (
              <Word
                key={`${word}-${index}`}
                text={word}
                status={wordsMap[key]?.status}
                isSelected={selectedIndexes.includes(index)}
                contextId={contextsByIndex[index] ?? ''}
                contextRecommendation={signal?.recommendation === 'context'}
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
              signals={selectionSignals}
            />
          ) : (
            <ContextPhraseModal
              phrase={selectedWords}
              wordIndexes={selectedIndexes}
              onClose={resetSelection}
              contextPhaseId={contextsByIndex[selectedIndexes[0]]}
              signals={selectionSignals}
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
