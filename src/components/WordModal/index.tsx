import React from 'react'

type Props = {
  isOpen: boolean
  onClose?: () => void
  children?: React.ReactNode
}

const WordModal: React.FC<Props> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  return (
    <div role="dialog">
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  )
}

export default WordModal
