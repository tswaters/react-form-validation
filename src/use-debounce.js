import { useRef, useCallback } from 'react'

const useDebounce = (fn, debounce) => {
  const timeoutRef = useRef(null)
  const argsRef = useRef(null)
  return useCallback(
    e => {
      if (debounce == null) return fn(e)
      e.persist()
      clearTimeout(timeoutRef.current)
      argsRef.current = e
      timeoutRef.current = setTimeout(() => fn(argsRef.current), debounce)
    },
    [debounce, fn]
  )
}

export { useDebounce }
