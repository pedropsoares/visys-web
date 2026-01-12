import React from 'react'

type Props = {
  totalWords?: number
}

const StatsSummary: React.FC<Props> = ({ totalWords = 0 }) => {
  return (
    <div>
      <strong>Total:</strong> {totalWords}
    </div>
  )
}

export default StatsSummary
