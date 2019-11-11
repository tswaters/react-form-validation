import { useState, useCallback } from 'react'

// using a map here to track all used errors
// returning the same ref should help with superflous renders

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

const useUpdateValidationState = ({ onValid, onError, onInvalid }) => {
  const [validated, setValidated] = useState(false)
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
  return { updateState, validated }
}

export { useUpdateValidationState }
