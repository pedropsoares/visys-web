interface Props {
  value: string;
  onChange: (value: string) => void;
}

import './TextInput.css';

export function TextInput({ value, onChange }: Props) {
  return (
    <div>
      <textarea
        id="text-input-area"
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole seu texto em inglês aqui."
      />
    </div>
  );
}
