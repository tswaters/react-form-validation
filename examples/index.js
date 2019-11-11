import { render } from 'react-dom'
import React, { useState, useCallback, useMemo } from 'react'
import { Form, FormGroup } from '@tswaters/react-form-validation'

const UserService = {
  checkIfAlreadyExists: () =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        if (Math.random() > 0.5) return reject(new Error('user exists'))
        resolve()
      }, 500)
    )
}

const UserInput = () => {
  const [loading, setLoading] = useState(false)
  const validations = useMemo(
    () => [
      async input => {
        setLoading(true)
        try {
          await UserService.checkIfAlreadyExists(input.value)
        } finally {
          setLoading(false)
        }
      }
    ],
    []
  )

  return (
    <FormGroup
      label="User Name"
      id="user-name"
      change={true}
      debounce={1500}
      name="user-name"
      validations={validations}
      className={loading ? 'loading' : ''}
    />
  )
}

const MyForm = () => {
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)

  const handleSubmit = useCallback(async e => {
    e.preventDefault()
    try {
      const res = await fetch('/api', {
        method: 'POST',
        body: new FormData(e.target),
        headers: {
          Accept: 'application/json'
        }
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
      <UserInput />
      <FormGroup
        id="name"
        name="name"
        label="Name"
        other="same-as"
        blur={true}
        recheck={true}
        required
        validations={[
          input =>
            input.value === 'Homer' ? new Error('no homers allowed') : null
        ]}
      />
      <FormGroup
        id="same-as"
        name="same-as"
        label="Same As"
        blur={true}
        recheck={true}
        required
        validations={[
          (input, fields) => {
            const other = fields.find(x => x.id === 'name')
            if (!other || other.value !== input.value)
              throw new Error('must match')
          }
        ]}
      />
      <button type="submit">Submit</button>
      {response && <div>{response}</div>}
      {error && <div>{error.message}</div>}
    </Form>
  )
}

render(
  <div className="container">
    <MyForm />
  </div>,
  document.getElementById('root')
)
