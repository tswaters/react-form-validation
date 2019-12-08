import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  memo,
  useCallback,
  useState
} from 'react'
import { oneOfType, arrayOf, func } from 'prop-types'
import { Input, Select, TextArea } from './input'

const mapDeep = (children, fn) =>
  Children.map(children, (child, index) =>
    isValidElement(child) &&
    Children.toArray(child.props.children).some(child => isValidElement(child))
      ? fn(
          cloneElement(child, {
            ...child.props,
            children: mapDeep(child.props.children, fn)
          }),
          index
        )
      : fn(child, index)
  )

const getCtorFromItem = item => {
  if (!isValidElement(item)) return null
  if (item.type === 'input') return Input
  if (item.type === 'select') return Select
  if (item.type === 'textarea') return TextArea
  return null
}

const Validator = ({ children, ...rest }) => {
  const [error, setError] = useState(null)
  const [valid, setValid] = useState(null)
  const [invalid, setInvalid] = useState(null)
  const [validated, setValidated] = useState(null)
  const handleError = useCallback(e => setError(e), [])
  const handleValid = useCallback(e => setValid(e), [])
  const handleInvalid = useCallback(e => setInvalid(e), [])
  const handleValidated = useCallback(e => setValidated(e), [])
  return mapDeep(children({ error, valid, invalid, validated }), item => {
    const myCtor = getCtorFromItem(item)
    if (myCtor == null) return item
    return createElement(myCtor, {
      ...rest,
      onError: handleError,
      onValid: handleValid,
      onInvalid: handleInvalid,
      onValidated: handleValidated,
      ...item.props
    })
  })
}

Validator.propTypes = {
  children: func.isRequired,
  validation: oneOfType([func, arrayOf(func)])
}

const memoized = memo(Validator)
memoized.displayName = `Memo(${Validator.displayName})`

export { Validator }
