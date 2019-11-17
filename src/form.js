import React, { memo, useCallback, useRef, forwardRef } from 'react'
import { func } from 'prop-types'
import { FormContext } from './context'

const getElement = (search, elements, mapper = x => x) =>
  elements[
    Array.from(elements)
      .map(mapper)
      .findIndex(x => x === search || x.id === search || x.name === search)
  ]

const Form = forwardRef(({ onSubmit, ...rest }, ref) => {
  const formRef = useRef(ref)
  const touched = useRef({})
  const fields = useRef([])

  /**
   * This is invoked from `useValidation`
   * Each element, as it's mounted, must register with us so we can do things with them
   * This happens in a `useEffect` - the disposable will call the unregister function.
   */
  const register = useCallback(
    (field, details) => fields.current.push({ field, details }),
    []
  )

  const unregister = useCallback(
    field =>
      (fields.current = fields.current.filter(
        f => f.field.name !== field.name
      )),
    []
  )

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
  const validateSingle = useCallback(async (formInput, force = false) => {
    const isTouched = touched.current[formInput.name]
    if (!force && !isTouched) return

    formInput.setCustomValidity('')
    if (!formInput.checkValidity()) return

    let error = null
    const field = getElement(formInput, fields.current, x => x.field)
    const others = fields.current.map(x => x.field)

    for (const fn of field.details.validation ?? []) {
      try {
        let err = await fn(formInput, others)
        if (typeof err === 'string') error = new Error(err)
        else if (err instanceof Error) error = err
      } catch (err) {
        error = err
      }
      if (error) break
    }

    if (error) {
      formInput.setCustomValidity(error.message)
      formInput.checkValidity()
    } else {
      field.details.updateState(error, formInput.validity)
    }
  }, [])

  /**
   * Validates a single input, accounting for `others`
   * If input has `others`: upon validation, all elements in `other` are validated as well.
   */
  const validate = useCallback(
    async ({ target: element }) => {
      const field = getElement(element, fields.current, x => x.field)
      await validateSingle(element)
      for (const item of field.details.otherArray) {
        const other = getElement(item, element.form.elements)
        if (other) await validateSingle(other)
      }
    },
    [validateSingle]
  )

  /**
   * Form submit handler
   * Verify each of our inputs passes validation before calling onSubmit
   * But if validation fails, it won't ever be called - make sure to not submit the form.
   */
  const handleSubmit = useCallback(
    async e => {
      e.persist()
      e.preventDefault()
      for (const { field } of fields.current) {
        await validateSingle(field, true)
      }
      if (e.target.checkValidity()) onSubmit?.(e)
    },
    [onSubmit, validateSingle]
  )

  const setInputTouched = useCallback(
    e => (touched.current[e.target.name] = true),
    [touched]
  )

  return (
    <FormContext.Provider
      value={{
        register,
        unregister,
        validate,
        setInputTouched
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit} {...rest}></form>
    </FormContext.Provider>
  )
})

Form.displayName = 'Form'

Form.propTypes = {
  onSubmit: func
}

const memoized = memo(Form)
memoized.displayName = 'Memo(Form)'

export { memoized as Form }
