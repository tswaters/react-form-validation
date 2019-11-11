import {
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo
} from 'react'

import { FormContext } from './context'

const errors = new Map()
const getErrorKey = (err, code) => `${err}_${code}`
const getError = (error, validity) => {
  if (validity.valid) return null
  let code = null
  for (const x in validity) if (validity[x]) code = x
  const key = getErrorKey(error, code)
  if (errors.has(key)) return errors.get(key)
  const _error = new Error(error)
  _error.code = code
  errors.set(key, _error)
  return _error
}

const useValidation = (
  innerRef,
  {
    onBlur,
    onChange,
    onClick,
    onFocus,
    validations,
    debounce,
    other,
    recheck,
    blur,
    change,
    click,
    onError,
    onInvalid,
    onValid
  }
) => {
  const ctx = useContext(FormContext)
  if (ctx == null) throw new Error('Input requires Form context')

  const { register, unregister, validate, setInputTouched } = ctx

  const timeoutRef = useRef(null)
  const argsRef = useRef(null)
  const [validated, setValidated] = useState(false)

  const waitForValidation = useCallback(
    e => {
      if (debounce == null) return validate(e)
      e.persist()
      clearTimeout(timeoutRef.current)
      argsRef.current = e
      timeoutRef.current = setTimeout(() => validate(argsRef.current), debounce)
    },
    [debounce, validate]
  )

  const updateState = useCallback(
    (error, validity) => {
      const is_valid = error == null || error === false || error === ''
      const is_invalid = !is_valid
      onValid?.(is_valid)
      onError?.(is_valid ? null : getError(error, validity))
      onInvalid?.(is_invalid)
      setValidated(true)
    },
    [onError, onValid, onInvalid]
  )

  const handleOnInvalid = useCallback(
    ({ target: element }) =>
      updateState(element.validationMessage, element.validity),
    [updateState]
  )

  const handleFocus = useCallback(
    e => {
      onFocus?.(e)
      setInputTouched(e)
    },
    [onFocus, setInputTouched]
  )

  const handleChange = useCallback(
    e => {
      onChange?.(e)
      if ((validated && recheck) || change) waitForValidation(e)
    },
    [onChange, recheck, change, validated, waitForValidation]
  )

  const handleBlur = useCallback(
    e => {
      onBlur?.(e)
      if (blur) waitForValidation(e)
    },
    [onBlur, blur, waitForValidation]
  )

  const handleClick = useCallback(
    e => {
      onClick?.(e)
      if (click) waitForValidation(e)
    },
    [onClick, click, waitForValidation]
  )

  const details = useMemo(
    () => ({
      validations,
      updateState,
      otherArray: other == null ? [] : Array.isArray(other) ? other : [other]
    }),
    [validations, updateState, other]
  )

  useEffect(() => {
    const thisRef = innerRef.current
    register(thisRef, details)
    return () => unregister(thisRef)
  }, [innerRef, register, unregister, details])

  useEffect(() => {
    const { current: thisRef } = innerRef
    thisRef?.addEventListener('invalid', handleOnInvalid)
    return () => thisRef?.removeEventListener('invalid', handleOnInvalid)
  }, [innerRef, handleOnInvalid])

  return { handleBlur, handleChange, handleClick, handleFocus }
}

export { useValidation }