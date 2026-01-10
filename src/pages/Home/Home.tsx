import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../components/TextInput/TextInput';
import { StatsSummary } from '../../components/StatsSummary/StatsSummary';
import { useWordStats } from '../../hooks/useWordStats';

export function Home() {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const stats = useWordStats();

  function handleSubmit() {
    if (!text.trim()) return;
    navigate('/text', { state: { text } });
  }

  return (
    <div className="page">
      <h1>Visys</h1>

      <StatsSummary
        learned={stats.learned}
        learning={stats.learning}
      /> 

      <TextInput value={text} onChange={setText} />

      <button onClick={handleSubmit}>Analyze text</button>
    </div>
  );
}


;