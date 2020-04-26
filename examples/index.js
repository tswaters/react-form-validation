import { render } from 'react-dom'
import React from 'react'
import { Form, Validator } from '@tswaters/react-form-validation'

render(
  <Form
    onSubmit={(e) => {
      e.preventDefault()
      console.log('SUBMITTING!!!!!')
    }}
    noValidate
  >
    <div className="container">
      <div className="card-group">
        <div className="card">
          <div className="card-header">Same-as Validation</div>
          <div className="card-body">
            <Validator
              blur
              recheck
              other="same-as"
              validation={(input) =>
                input.value === 'Homer' ? new Error('no homers allowed') : null
              }
            >
              {({ error, validated }) => (
                <div
                  className={`form-group ${validated ? 'was-validated' : ''}`}
                >
                  <label className="control-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="form-control"
                    required
                    type="text"
                  />
                  {error && (
                    <div className="invalid-feedback">{error.message}</div>
                  )}
                </div>
              )}
            </Validator>
            <Validator
              blur
              recheck
              validation={(input, fields) => {
                const other = fields.find((x) => x.id === 'name')
                if (!other || other.value !== input.value)
                  return new Error('must match')
              }}
            >
              {({ error, validated }) => {
                return (
                  <div
                    className={`form-group ${validated ? 'was-validated' : ''}`}
                  >
                    <label className="control-label" htmlFor="same-as">
                      Same-as
                    </label>
                    <input
                      id="same-as"
                      name="same-as"
                      className="form-control"
                      required
                      type="text"
                    />
                    {error && (
                      <div className="invalid-feedback">{error.message}</div>
                    )}
                  </div>
                )
              }}
            </Validator>
          </div>
        </div>
      </div>
      <div className="card-group">
        <div className="card">
          <div className="card-header">Checkboxes and Radios</div>
          <div className="card-body">
            <Validator click>
              {({ error, validated }) => (
                <fieldset
                  className={`form-group ${validated ? 'was-validated' : ''}`}
                >
                  <div className="custom-control custom-checkbox">
                    <input
                      required
                      className="custom-control-input"
                      type="checkbox"
                      id="acceptance"
                      name="acceptance"
                      value="accept"
                    />
                    <label
                      htmlFor="acceptance"
                      className="custom-control-label"
                    >
                      You must accept!
                    </label>
                  </div>
                  {error && (
                    <div className="d-block invalid-feedback">
                      {error.message}
                    </div>
                  )}
                </fieldset>
              )}
            </Validator>

            <Validator click>
              {({ error, validated }) => (
                <fieldset className={`${validated ? 'was-validated' : ''}`}>
                  <div className="row">
                    <legend className="col-form-label col-sm-2 pt-0">
                      Radios
                    </legend>
                    <div className="col-sm-10">
                      <div className="custom-control custom-radio">
                        <input
                          required
                          className="custom-control-input"
                          type="radio"
                          id="yes"
                          name="choose-something"
                          value="yes"
                          label="Yes"
                        />
                        <label htmlFor="yes" className="custom-control-label">
                          Yes
                        </label>
                      </div>
                      <div className="custom-control custom-radio">
                        <input
                          required
                          className="custom-control-input"
                          type="radio"
                          id="no"
                          name="choose-something"
                          value="no"
                          label="No"
                        />
                        <label htmlFor="no" className="custom-control-label">
                          No
                        </label>
                      </div>
                    </div>
                    {error && (
                      <div className="d-block invalid-feedback">
                        {error.message}
                      </div>
                    )}
                  </div>
                </fieldset>
              )}
            </Validator>
          </div>
        </div>
        <div className="card">
          <div className="card-header">A Select</div>
          <div className="card-body">
            <Validator>
              {({ error, validated }) => (
                <div
                  className={`form-group ${validated ? 'was-validated' : ''}`}
                >
                  <label className="control-label" htmlFor="same-as">
                    Choose something
                  </label>
                  <select
                    id="choice"
                    name="choice"
                    className="form-control"
                    required
                  >
                    <option></option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  {error && (
                    <div className="invalid-feedback">{error.message}</div>
                  )}
                </div>
              )}
            </Validator>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">A Text Area</div>
        <div className="card-body">
          <Validator>
            {({ error, validated }) => (
              <div className={`form-group ${validated ? 'was-validated' : ''}`}>
                <label className="control-label" htmlFor="essay">
                  Write an essay
                </label>
                <textarea
                  id="essay"
                  name="essay"
                  className="form-control"
                  minLength={500}
                  rows={4}
                  required
                  defaultValue={
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Semper risus in hendrerit gravida.'
                  }
                />
                {error && (
                  <div className="invalid-feedback">{error.message}</div>
                )}
              </div>
            )}
          </Validator>
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
