# React Form Validation

<a href="https://www.npmjs.org/package/@tswaters/react-form-validation"><img
  src="https://img.shields.io/npm/v/@tswaters/react-form-validation" alt="npm version"></a>
<a href="https://travis-ci.org/tswaters/react-form-validation/"><img
  src="https://img.shields.io/travis/tswaters/react-form-validation" alt="build status"></a>
<a href="https://coveralls.io/github/tswaters/react-form-validation"><img
  src="https://img.shields.io/coveralls/github/tswaters/react-form-validation" alt="coverage"></a>
<a href="https://github.com/tswaters/react-form-validation/blob/master/LICENSE"><img
  src="https://img.shields.io/npm/l/@tswaters/react-form-validation" alt="license (MIT)"></a>

The goal of this library is to implement the [Constraint Validation API](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api) in React while not getting in your way to do it.

Of the existing react form libraries, the use of the constraint validation api is woefully inadequate. Using this API properly is important for accessibility - you need to let the user agent know what is going on.

- [usage](#usage)

- [api](#api)

  - [Form](#form)
  - [form element components](#form-element-components)
  - [Validator](#validator)

- [examples](#examples)

  - [implementing bootstrap's FormGroup](#implementing-bootstraps-formgroup)
  - [custom validation functions](#custom-validation-functions)

- [a note on errors](#a-note-on-errors)

- [limitations / bugs](#limitations--bugs)

## usage

You can import the `Form` and `Input/Select/TextArea` exports from this library.

These are wrappers around `<form/>` and `<input/select/textarea>` elements. Any additional props you provide to these elements will be passed down to the underlying `form/input/select/textarea` element. If you need to, you can also access the underlying element by passing a `ref`.

`Input` elements must be children of a `Form` element. Under the covers, this library uses context to keep track of all fields on the form and will validate all of them if the form is submitted.

A `Validator` component is also provided which attempts to make using the api a bit easier. This is a container element that uses a render prop which is called with `({ error, valid, invalid, validated })`. This routine recursively traverses any provided props to replace `input/select/textarea` elements with the exports from this library, so it will duplicate any work already done up to that point.

## api

### Form

```jsx
import { Form } from '@tswaters/react-form-validation'
const example = () => {
  return <Form />
}
```

- **ref** - you can pass a `ref` to get a reference to the underlying `<form>` element

- any additional props will be passed down to the underlying `<form>` element

- **NOTE:** onSubmit will only be called if the form passes validation!

- **NOTE:** this library calls `preventDefault` to do async validations.

### Form element components

Input/Select/TextArea take all the same props.

```jsx
import { Input, Select, TextArea } from '@tswaters/react-form-validation'
const example = () => (
  <>
    <Input // Select | TextArea
      validation={oneOfType([arrayOf(func), func])}
      other={oneOfType([arrayOf(string), string])}
      recheck={bool}
      blur={bool}
      change={bool}
      onError={func}
      onInvalid={func}
      onValid={func}
      onValidated={func}
    />
  </>
)
```

- **validation** _(field, others) => Promise<void|string|Error>_

  An function, or array of functions. Will be called for validation with two parameters (`field` - reference to the `input/select/textarea`; `others` - an array of all form inputs). You can return:

  - an error
  - a string (this will be interpreted as an error)
  - null/undefined (returning nothing signifies validation passes)
  - throwing an error will be interpreted as failing validation

* **other** _string|string[]_ - provide the name or id of another element on the form. When validating this element, the other(s) will also have their validation routines called, assuming they have not yet been touched.

* **blur** _bool_ - validate this field on input blur

* **change** _bool_ - validate this field on input change

* **recheck** _bool_ - if recheck is passed as TRUE, once a form field is validated it will be revalidated on any change.

- **onError** _(Error|null) => void_ - will be called if there is a validation error. This will always be an error object (so check `message` / `code`), or `null` if there is no error.

- **onInvalid** _(bool) => void_ will be called after validation with a bool indicating the form field is invalid

- **onValid** _(bool) => void_ will be called after validation with a bool indicating the form field is valid

- **onValidated** _(bool) => void_ will be called after an input is validated.

Any additional props will be passed down to the underlying `input/select/textarea` element

### Validator

```jsx
import { Validator } from '@tswaters/react-form-validation'
const example = () => (
  <Validator recheck blur>
    {({ error, valid, invalid }) => (
      <>
        <label htmlFor="my-value">My Value</label>
        <input id="my-value" name="my-value" type="text" required />
        {valid && <div>valid</div>}
        {invalid && <div>invalid</div>}
        {error && <div>{error.message}</div>}
      </>
    )}
  </Validator>
)
```

The validator will find & replace all `input/select/textarea` elements with `Input/Select/TextArea`.

The render prop, `({ error, valid, invalid, validated })` will be updated with any feedback from the constraint validation API.

Any props provided to `validator` will be passed through to the underlying `Input/Select/TextArea` elements.

## examples

### implementing bootstrap's FormGroup

```js
const FormGroup = ({ id, label, ...rest }) => {
  return (
    <Validator recheck blur>
      {({ error, validated }) => (
        <div className={`form-group ${validated ? 'was-validated' : ''}`}>
          <label className="control-label" htmlFor={id}>
            {label}
          </label>
          <input id={id} className="form-control" {...rest} />
          {error && <div className="invalid-feedback">{error.message}</div>}
        </div>
      )}
    </Validator>
  )
}

const LoginForm = () => {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormGroup id="user-name" name="user-name" label="User Name" required />
      <FormGroup
        id="password"
        name="password"
        label="Password"
        type="password"
        required
      />
      <button type="submit">Submit</button>
    </Form>
  )
}
```

### custom validation functions

You can provide validations to the `<Input/Select/TextArea>` element and they will be called as part of validating the element.

These validation routines can be async and await their response. Form submission will be blocked while validations are awaiting their response.

The validation routine will consider something as failed with the following returns:

- a string - the error returned will be `new Error(returnValue)`

- an error - the error returned will be `returnValue`

- throw an error - the error returned will be `thrownValue`

Otherwise, the validation is considered to have succeeded.

```js
import { Validator, Input } from '@tswaters/react-form-validation'

const MyForm = () => {
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(true)

  const validation = useMemo(
    () => [
      async (input) => {
        setLoading(true)
        try {
          await UserService.checkIfAlreadyExists(input.value)
        } finally {
          setLoading(false)
        }
      },
    ],
    []
  )

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api', {
        method: 'POST',
        body: new FormData(e.target),
        headers: {
          Accept: 'application/json',
        },
      })
      const data = await res.json()
      if (res.ok) return setResponse(data)
      throw data
    } catch (err) {
      setError(err)
    }
  }, [])

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Validator>
        {({ error }) => (
          <input
            name="user-name"
            change={true}
            debounce={500}
            validation={validation}
            className={loading ? 'loading' : ''}
          />
        )}
      </Validator>
      <button type="submit">Submit</button>
      {response && <div>{response}</div>}
      {error && <div>{error.message}</div>}
    </Form>
  )
}
```

## a note on errors

Any errors for non-custom validation routines will be returned by the browser, so based upon the user's OS/browser language settings, you'll get different translated error messages, for better or worse.

`message` will be populated with the browser-defined error, and a `code` is also set that identifies the type of error that occured. As an example, an error raised from a required input not being provided might look something like this:

```json
{
  "message": "Please provide a value",
  "code": "valueMissing"
}
```

You can override the translations by inspecting the code and providing the correct translation:

```js
const ErrorDisplay = error => {
  const [t] = useTranslation() // or however else you get a translation function
  return error ? t(`validation-error-${error.code}` : null
}
```

For custom error messages, `error.message` will be whatever you returned or threw back and the code will be `customError`

## Thoughts on Performance

- make sure the tree passed via `<Validator />` is pretty simple. Validator recursively traverses the tree and replaces html inputs with exports from this library.

- validation functions should be memoized lest any change invoke a re-render (wrap functions with `useCallback`, or an array of functions with `memo`)

## limitations / bugs

- only the first error for a given input element will be returned

- there's gunna be some weirdness with `code` returning incorrectly if multiple constraint errors are raised.
