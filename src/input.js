import React, { memo, useRef, forwardRef } from 'react'
import { func, bool, arrayOf, oneOfType, string, number } from 'prop-types'

import { useValidation } from './use-validation'

const propTypes = {
  onBlur: func,
  onChange: func,
  onClick: func,
  onFocus: func,
  validations: arrayOf(func),
  other: oneOfType([arrayOf(string), string]),
  debounce: number,
  recheck: bool,
  blur: bool,
  change: bool,
  click: bool,
  onError: func,
  onValid: func,
  onInvalid: func,
  name: string.isRequired // form elements must have name!
}

const createInput = inputType => {
  const Wrapped = forwardRef(
    (
      {
        onBlur,
        onClick,
        onChange,
        onFocus,
        validations,
        debounce,
        other,
        recheck,
        blur,
        change,
        click,
        onError,
        onValid,
        onInvalid,
        ...rest
      },
      ref
    ) => {
      const innerRef = useRef(ref)

      const {
        handleBlur,
        handleChange,
        handleClick,
        handleFocus
      } = useValidation(innerRef, {
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
        onValid,
        onInvalid
      })

      return React.createElement(inputType, {
        ref: innerRef,
        onBlur: handleBlur,
        onChange: handleChange,
        onClick: handleClick,
        onFocus: handleFocus,
        ...rest
      })
    }
  )

  Wrapped.isFormElement = true
  Wrapped.displayName = `Validated(${inputType})`
  Wrapped.propTypes = propTypes

  const memoized = memo(Wrapped)
  memoized.displayName = `Memo(${Wrapped.displayName})`
  return Wrapped
}

const Input = createInput('input')
const Select = createInput('select')
const TextArea = createInput('textarea')

export { Input, Select, TextArea }
