import { render } from 'react-dom'
import React, { useState, useCallback, useMemo } from 'react'
import {
  Input,
  Form,
  Select,
  FormGroup,
  TextArea
} from '@tswaters/react-form-validation'

const AsyncValidation = () => {
  const [shouldResolve, setShouldResolve] = useState(false)
  const [loading, setLoading] = useState(false)
  const getUserService = useCallback(
    () =>
      new Promise((resolve, reject) =>
        setTimeout(
          () => (shouldResolve ? resolve() : reject(new Error('user exists'))),
          500
        )
      ),
    [shouldResolve]
  )

  const validations = useMemo(
    () => [
      async () => {
        setLoading(true)
        try {
          await getUserService()
        } finally {
          setLoading(false)
        }
      }
    ],
    [getUserService]
  )

  return (
    <>
      <FormGroup label="User Name" className={loading ? 'loading' : ''}>
        <Input
          type="text"
          id="user-name"
          required
          change={true}
          debounce={1500}
          name="user-name"
          validations={validations}
        />
      </FormGroup>
      <div className="form-group">
        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="resovle"
            name="resovle"
            className="custom-control-input"
            onChange={() => setShouldResolve(true)}
            checked={shouldResolve}
          />
          <label className="custom-control-label" htmlFor="resovle">
            Resolve
          </label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input
            type="radio"
            id="reject"
            name="reject"
            className="custom-control-input"
            onChange={() => setShouldResolve(false)}
            checked={!shouldResolve}
          />
          <label className="custom-control-label" htmlFor="reject">
            Reject
          </label>
        </div>
      </div>
    </>
  )
}

render(
  <Form onSubmit={() => console.log('SUBMITTING!!!!!')} noValidate>
    <div className="container">
      <div className="card-group">
        <div className="card">
          <div className="card-header">Same-as Validation</div>
          <div className="card-body">
            <FormGroup label="Name">
              <Input
                id="name"
                name="name"
                other="same-as"
                blur={true}
                recheck={true}
                required
                validations={[
                  input =>
                    input.value === 'Homer'
                      ? new Error('no homers allowed')
                      : null
                ]}
              />
            </FormGroup>
            <FormGroup label="Same As">
              <Input
                id="same-as"
                name="same-as"
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
            </FormGroup>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Async Validation</div>
          <div className="card-body">
            <AsyncValidation />
          </div>
        </div>
      </div>
      <div className="card-group">
        <div className="card">
          <div className="card-header">A Select</div>
          <div className="card-body">
            <FormGroup label="Choose something">
              <Select id="choice" name="choice" required>
                <option></option>
                <option>Yes</option>
                <option>No</option>
              </Select>
            </FormGroup>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">A Text Area</div>
        <div className="card-body">
          <FormGroup label="Write an essay">
            <TextArea
              id="essay"
              name="essay"
              minLength={500}
              rows={4}
              required
              defaultValue={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Semper risus in hendrerit gravida.'
              }
            />
          </FormGroup>
          <p>
            {`Interesting bug with this one^ hit submit and it won't find you haven't broken the minLength requirement. Make any change and it will`}
          </p>
        </div>
      </div>
      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </div>
  </Form>,
  document.getElementById('root')
)
