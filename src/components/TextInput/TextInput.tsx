interface Props {
  value: string;
  onChange: (value: string) => void;
}

import './TextInput.css';

export function TextInput({ value, onChange }: Props) {
  return (
    <div>
      {/* Exemplo de label BEM */}
      <textarea
        id="text-input-area"
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your English text here"
      />
    </div>
  );
}
