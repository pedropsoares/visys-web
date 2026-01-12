interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

import './TextInput.css';

export function TextInput({ value, onChange, disabled }: Props) {
  const maxLength = 1665;
  const currentLength = value.length;

  return (
    <div>
      <div className="text-input__label">
        Limite de caracteres: {currentLength}/{maxLength}
      </div>
      <textarea
        id="text-input-area"
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cole seu texto em inglês aqui."
        maxLength={maxLength}
        disabled={disabled}
      />
    </div>
  );
}
