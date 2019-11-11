import React, { forwardRef, useMemo, useCallback, useState } from 'react'
import { string, array, oneOfType, arrayOf } from 'prop-types'
import { Input } from './input'

const propTypes = {
  id: string.isRequired,
  name: string.isRequired,
  className: string,
  label: string.isRequired,
  validations: array,
  other: oneOfType([arrayOf(string), string])
}

const FormGroup = forwardRef(
  ({ className = '', id, label, validations, other, ...rest }, ref) => {
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(null)
    const [invalid, setInvalid] = useState(null)
    const wasValidated = useMemo(() => error || valid || invalid, [
      error,
      valid,
      invalid
    ])
    const handleError = useCallback(e => setError(e), [])
    const handleValid = useCallback(e => setValid(e), [])
    const handleInvalid = useCallback(e => setInvalid(e), [])
    return (
      <div
        className={`form-group ${
          wasValidated ? 'was-validated' : ''
        } ${className}`}
      >
        <label className="control-label" htmlFor={id}>
          {label}
        </label>
        <Input
          ref={ref}
          id={id}
          className="form-control"
          type="text"
          other={other}
          validations={validations}
          onError={handleError}
          onValid={handleValid}
          onInvalid={handleInvalid}
          {...rest}
        />
        {error && <div className="invalid-feedback">{error.message}</div>}
      </div>
    )
  }
)

FormGroup.displayName = 'FormGroup'

FormGroup.propTypes = propTypes
export { FormGroup }
