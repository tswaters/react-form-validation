import { useEffect, useContext, useCallback } from 'react'
import { FormContext } from './context'

const useFormContext = (inputRef, details) => {
  const ctx = useContext(FormContext)
  if (ctx == null) throw new Error('Input requires Form context')

  const { updateState } = details
  const { register, unregister, ...rest } = ctx

  useEffect(() => {
    const thisRef = inputRef.current
    register(thisRef, details)
    return () => unregister(thisRef)
  }, [inputRef, register, unregister, details])

  const handleOnInvalid = useCallback(
    ({ target: element }) =>
      updateState(element.validationMessage, element.validity),
    [updateState]
  )

  useEffect(() => {
    const { current: thisRef } = inputRef
    thisRef?.addEventListener('invalid', handleOnInvalid)
    return () => thisRef?.removeEventListener('invalid', handleOnInvalid)
  }, [inputRef, handleOnInvalid])

  return rest
}

export { useFormContext }
