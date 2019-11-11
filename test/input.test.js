import React from 'react'

import { equal, throws } from 'assert'
import { stub } from 'sinon'
import { mount } from 'enzyme'

import { Form, Input } from '../src/index'

const wait = () => new Promise(resolve => setImmediate(resolve))

describe('input', () => {
  it('throws with no form context', () => {
    throws(() => mount(<Input />), /Input requires Form context/)
  })

  it('renders properly', () => {
    const wrapper = mount(
      <Form>
        <Input />
      </Form>
    )
    equal(wrapper.find('input').length, 1)
  })

  it('handles validation', async () => {
    let error = null
    let valid = null
    let invalid = null

    const wrapper = mount(
      <Form>
        <Input
          blur
          required
          onError={e => (error = e)}
          onValid={e => (valid = e)}
          onInvalid={e => (invalid = e)}
        />
      </Form>
    )

    const input = wrapper.find('input')
    input.simulate('focus').simulate('blur')

    await wait()
    equal(error.code, 'valueMissing')
    equal(valid, false)
    equal(invalid, true)

    input.getDOMNode().value = 'test'
    input.simulate('blur')

    await wait()
    equal(error, null)
    equal(valid, true)
    equal(invalid, false)

    wrapper.unmount()
  })

  it('validates upon form submission', async () => {
    const onSubmitStub = stub()
    let error = null
    let valid = null
    let invalid = null

    const wrapper = mount(
      <Form onSubmit={onSubmitStub}>
        <Input
          required
          onError={e => (error = e)}
          onValid={e => (valid = e)}
          onInvalid={e => (invalid = e)}
        />
      </Form>
    )

    const input = wrapper.find('input').getDOMNode()
    const form = wrapper.find('form').getDOMNode()
    form.submit()

    await wait()
    equal(error.code, 'valueMissing')
    equal(valid, false)
    equal(invalid, true)

    input.value = 'test'
    form.submit()

    await wait()
    equal(error, null)
    equal(valid, true)
    equal(invalid, false)

    equal(onSubmitStub.callCount, 1)
    wrapper.unmount()
  })

  it('handles others properly', async () => {
    const onSubmitStub = stub()
    let oneError = null
    let oneValid = null
    let oneInvalid = null
    let twoError = null
    let twoValid = null
    let twoInvalid = null

    const wrapper = mount(
      <Form onSubmit={onSubmitStub}>
        <Input
          id="one"
          name="one"
          required
          blur
          other="two"
          onError={e => (oneError = e)}
          onValid={e => (oneValid = e)}
          onInvalid={e => (oneInvalid = e)}
        />
        <Input
          id="two"
          name="two"
          required
          validations={[
            (input, others) => {
              const other = others.find(x => x.id === 'one')
              if (other.value !== input.value) return new Error('must match')
            }
          ]}
          onError={e => (twoError = e)}
          onValid={e => (twoValid = e)}
          onInvalid={e => (twoInvalid = e)}
        />
      </Form>
    )

    const form = wrapper.find('form').getDOMNode()
    const oneInput = wrapper.find('input#one')
    const twoInput = wrapper.find('input#two')

    oneInput.simulate('focus').getDOMNode().value = 'one'
    twoInput.simulate('focus').getDOMNode().value = 'two'
    form.submit()

    await wait()
    equal(oneValid, true)
    equal(oneInvalid, false)
    equal(oneError, null)
    equal(twoValid, false)
    equal(twoInvalid, true)
    equal(twoError.code, 'customError')
    equal(onSubmitStub.callCount, 0)

    oneInput.getDOMNode().value = 'two'
    oneInput.simulate('blur')

    await wait()
    equal(oneValid, true)
    equal(oneInvalid, false)
    equal(oneError, null)
    equal(twoValid, true)
    equal(twoInvalid, false)
    equal(twoError, null)

    form.submit()

    await wait()
    equal(onSubmitStub.callCount, 1)
    wrapper.unmount()
  })
})
