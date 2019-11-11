import React from 'react'

import { equal, throws } from 'assert'
import { stub } from 'sinon'
import { mount } from 'enzyme'

import { Form, Input, Select, TextArea } from '../src/index'

const wait = () => new Promise(resolve => setImmediate(resolve))

describe('input types', () => {
  describe('textarea', () => {
    it('throws with no form context', () => {
      throws(() => mount(<TextArea />), /Input requires Form context/)
    })
    it('renders properly', () => {
      const wrapper = mount(
        <Form>
          <TextArea></TextArea>
        </Form>
      )
      equal(wrapper.find('textarea').length, 1)
    })

    it('handles validation', async () => {
      let error = null
      let valid = null
      let invalid = null

      const wrapper = mount(
        <Form>
          <TextArea
            recheck
            blur
            required
            onError={e => (error = e)}
            onValid={e => (valid = e)}
            onInvalid={e => (invalid = e)}
          />
        </Form>
      )

      const textarea = wrapper.find('textarea')
      textarea.simulate('focus').simulate('blur')

      await wait()
      equal(error.code, 'valueMissing')
      equal(valid, false)
      equal(invalid, true)

      textarea.getDOMNode().value = 'test' // you're tearing me apart enzyme
      textarea.simulate('blur')

      await wait()
      equal(error, null)
      equal(valid, true)
      equal(invalid, false)

      wrapper.unmount()
    })
  })

  describe('select', () => {
    it('throws with no form context', () => {
      throws(() => mount(<Select />), /Input requires Form context/)
    })
    it('renders properly', () => {
      const wrapper = mount(
        <Form>
          <Select>
            <option></option>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </Select>
        </Form>
      )
      equal(wrapper.find('select').length, 1)
    })

    it('handles validation', async () => {
      let error = null
      let valid = null
      let invalid = null

      const wrapper = mount(
        <Form>
          <Select
            recheck
            blur
            required
            onError={e => (error = e)}
            onValid={e => (valid = e)}
            onInvalid={e => (invalid = e)}
          >
            <option></option>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </Select>
        </Form>
      )

      const select = wrapper.find('select')
      select.simulate('focus').simulate('blur')

      await wait()
      equal(error.code, 'valueMissing')
      equal(valid, false)
      equal(invalid, true)

      select.getDOMNode().selectedIndex = 1 // you're tearing me apart enzyme
      select.simulate('blur')

      await wait()
      equal(error, null)
      equal(valid, true)
      equal(invalid, false)

      wrapper.unmount()
    })
  })

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

      input.getDOMNode().value = 'test' // you're tearing me apart enzyme
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

      const input = wrapper.find('input')
      const form = wrapper.find('form')
      form.getDOMNode().submit()

      await wait()
      equal(error.code, 'valueMissing')
      equal(valid, false)
      equal(invalid, true)

      input.getDOMNode().value = 'test' // you're tearing me apart enzyme
      form.getDOMNode().submit()

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

      oneInput.simulate('focus').getDOMNode().value = 'one' // you're tearing me apart enzyme
      twoInput.simulate('focus').getDOMNode().value = 'two' // you're tearing me apart enzyme
      form.submit()

      await wait()
      equal(oneValid, true)
      equal(oneInvalid, false)
      equal(oneError, null)
      equal(twoValid, false)
      equal(twoInvalid, true)
      equal(twoError.code, 'customError')
      equal(onSubmitStub.callCount, 0)

      oneInput.getDOMNode().value = 'two' // you're tearing me apart enzyme
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
})
