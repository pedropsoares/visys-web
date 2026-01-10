import React from 'react'

type Props = {
  text: string
}

const Word: React.FC<Props> = ({ text }) => <span>{text}</span>

export default Word
