import React, { memo, useMemo, useRef, useCallback, forwardRef } from 'react'
import { func, bool, arrayOf, oneOfType, string, number } from 'prop-types'

import { useFormContext } from './use-form-context'
import { useDebounce } from './use-debounce'
import { useUpdateValidationState } from './use-update-validation-state'

const propTypes = {
  onBlur: func,
  onChange: func,
  onFocus: func,
  validations: arrayOf(func),
  other: oneOfType([arrayOf(string), string]),
  debounce: number,
  recheck: bool,
  blur: bool,
  change: bool,
  onError: func,
  onInvalid: func,
  onValid: func,
  name: string.isRequired // form elements must have name!
}

const Input = memo(
  forwardRef(
    (
      {
        onBlur,
        onChange,
        onFocus,
        validations,
        debounce,
        other,
        recheck,
        blur,
        change,
        onError,
        onInvalid,
        onValid,
        ...rest
      },
      ref
    ) => {
      const innerRef = useRef(ref)

      const { updateState, validated } = useUpdateValidationState({
        onError,
        onValid,
        onInvalid
      })

      const details = useMemo(
        () => ({
          validations,
          updateState,
          otherArray:
            other == null ? [] : Array.isArray(other) ? other : [other]
        }),
        [validations, updateState, other]
      )

      const { validate, setInputTouched } = useFormContext(innerRef, details)
      const waitForValidation = useDebounce(validate, debounce)

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

      return (
        <input
          ref={innerRef}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          {...rest}
        />
      )
    }
  )
)

Input.displayName = 'Input'

Input.propTypes = propTypes

export { Input }
