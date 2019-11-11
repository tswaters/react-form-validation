import React, { memo, forwardRef, useMemo, useCallback, useState } from 'react'
import { node, string } from 'prop-types'

const propTypes = {
  className: string,
  label: string.isRequired,
  children: node.isRequired
}

const FormGroup = forwardRef(
  ({ children, className = '', label, ...rest }, ref) => {
    const [error, setError] = useState(null)
    const [valid, setValid] = useState(null)
    const [invalid, setInvalid] = useState(null)
    const wasValidated = useMemo(
      () => (error || valid || invalid ? 'was-validated' : ''),
      [error, valid, invalid]
    )
    const onError = useCallback(e => setError(e), [])
    const onValid = useCallback(e => setValid(e), [])
    const onInvalid = useCallback(e => setInvalid(e), [])
    return (
      <div className={`form-group ${wasValidated} ${className}`}>
        <label className="control-label" htmlFor={children.props.id}>
          {label}
        </label>
        {React.cloneElement(React.Children.only(children), {
          ref,
          className: 'form-control',
          type: 'text',
          onError,
          onValid,
          onInvalid,
          ...rest
        })}
        {error && <div className="invalid-feedback">{error.message}</div>}
      </div>
    )
  }
)

FormGroup.displayName = 'FormGroup'
FormGroup.propTypes = propTypes

const memoized = memo(FormGroup)
memoized.displayName = `Memo(${FormGroup.displayName})`

export { memoized as FormGroup }
