import { useState } from 'react'

export const useExample = () => {
  const [state, setState] = useState(null)
  return { state, setState }
}
