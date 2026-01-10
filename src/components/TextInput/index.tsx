import React from 'react'

type Props = {
  value?: string
  onChange?: (v: string) => void
}

const TextInput: React.FC<Props> = ({ value = '', onChange }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      aria-label="text-input"
    />
  )
}

export default TextInput
