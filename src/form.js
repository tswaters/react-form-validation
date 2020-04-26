import React, {
  memo,
  createContext,
  useCallback,
  useRef,
  forwardRef,
} from 'react'
import { func } from 'prop-types'
export const FormContext = createContext(null)

const getName = (ref) => ref.id || ref.name

const Form = forwardRef(({ onSubmit, ...rest }, ref) => {
  const formRef = useRef(ref)
  const touched = useRef({})
  const fields = useRef({})

  /**
   * This is invoked from `useValidation`
   * Each element, as it's mounted, must register with us so we can do things with them
   * This happens in a `useEffect` - the disposable will call the unregister function.
   */
  const register = useCallback((ref, ctx) => {
    fields.current[getName(ref)] = { ref, ctx }
  }, [])

  const unregister = useCallback((ref) => {
    delete fields.current[getName(ref)]
  }, [])

  /**
   * Validates a single input.
   * - Pass in a formInput to find relevant details (validation, update state function) from our fields ref.
   * - this allows calling this routine from anywhere which is useful.
   * - Also we pass along all the other form inputs so validation routines can check the state of the form.
   *
   * This is called in form#submit, and potentially change/blur on individual elements if configured.
   * - must have been touched OR force = true
   * - if constraints fail, return early with those errors
   * - if constraints pass, call custom validation routines (if any)
   * - if we get back an error from custom validation, set it on the input.
   * - otherwise, call into `updateState` which fires callbacks for state updates
   *
   * @param {HtmlInputElement} formInput the input to validate
   * @param {boolean} [force=false] whether to bypass touched check.
   */
  const validateSingle = useCallback((ref, force = false) => {
    const isTouched = touched.current[ref.name]
    if (!force && !isTouched) return

    ref.setCustomValidity('')
    if (!ref.checkValidity()) return // the invalid event will have fired.

    const { ctx } = fields.current[getName(ref)]
    const refs = Object.entries(fields.current).map(([, { ref }]) => ref)

    let [error] = (ctx.validation ?? [])
      .map((fn) => fn(ref, refs))
      .filter((valResult) => valResult != null)

    if (typeof error === 'string') error = new Error(error)

    if (error != null) {
      ref.setCustomValidity(error.message)
      ref.checkValidity()
    } else {
      ctx.updateState(null, ref.validity)
    }
  }, [])

  /**
   * Validates a single input, accounting for `others`
   * If input has `others`: upon validation, all elements in `other` are validated as well.
   */
  const validate = useCallback(
    ({ target: element }) => {
      const { ctx } = fields.current[getName(element)]
      const allFields = ctx.otherArray.reduce(
        (acc, item) => {
          const other = fields.current[item]
          if (other) acc.push(other.ref)
          return acc
        },
        [element]
      )

      allFields.forEach((field) => validateSingle(field))
    },
    [validateSingle]
  )

  /**
   * Form submit handler
   * Verify each of our inputs passes custom validation before calling onSubmit
   * If custom validation fails replicate existing dom behavior of not submitting
   */
  const handleSubmit = useCallback(
    (e) => {
      for (const [, { ref }] of Object.entries(fields.current)) {
        validateSingle(ref, true)
      }
      if (e.target.checkValidity()) {
        onSubmit?.(e)
      } else {
        e.preventDefault()
      }
    },
    [onSubmit, validateSingle]
  )

  const setInputTouched = useCallback(
    (e) => (touched.current[e.target.name] = true),
    [touched]
  )

  return (
    <FormContext.Provider
      value={{
        register,
        unregister,
        validate,
        setInputTouched,
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit} {...rest}></form>
    </FormContext.Provider>
  )
})

Form.displayName = 'Form'

Form.propTypes = {
  onSubmit: func,
}

const memoized = memo(Form)
memoized.displayName = 'Memo(Form)'

export { memoized as Form }
