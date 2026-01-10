import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { extractWords } from '../../services/textProcessingService';
import { WordModal } from '../../components/WordModal/WordModal';
import { Word } from '../../components/Word/Word';
import { useWordsMap } from '../../hooks/useWordsMap';

import './TextInteractive.css';

export function TextInteractive() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const words = extractWords(state.text);

  const { wordsMap, upsertWord } = useWordsMap();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  function returnHome() {
    navigate('/');
  }

  return (
    <div className="page">
      <div className="text-interactive">
        <button className="text-interactive__button" onClick={returnHome}>Voltar</button>
        <div className="text-interactive__words">
          {words.map((word, index) => {
            const key = word.toLowerCase();
            return (
              <Word
                key={`${word}-${index}`}
                text={word}
                status={wordsMap[key]?.status}
                isSelected={word === selectedWord}
                onClick={() => setSelectedWord(word)}
              />
            );
          })}
        </div>

        {selectedWord && (
          <WordModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
            onSaved={upsertWord}
          />
        )}
      </div>
    </div>
  );
}
