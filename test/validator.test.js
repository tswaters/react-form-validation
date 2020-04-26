import React from 'react'
import { stub } from 'sinon'
import { mount } from 'enzyme'
import { equal } from 'assert'
import { Form, Validator } from '../src/index'

describe('validator', () => {
  it('renders properly with a variety of children types', () => {
    let wrapper = mount(<Validator>{() => 'hola'}</Validator>)
    equal(wrapper.text(), 'hola')

    wrapper = mount(<Validator>{() => <div>hola</div>}</Validator>)
    equal(wrapper.find('div').text(), 'hola')

    wrapper = mount(
      <Form>
        <Validator>{() => <input />}</Validator>
      </Form>
    )
    equal(wrapper.find('input').length, 1)
    equal(Object.keys(wrapper.find('input').props()).length, 4)

    wrapper = mount(
      <Form>
        <Validator>
          {() => (
            <select>
              <option></option>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          )}
        </Validator>
      </Form>
    )
    equal(wrapper.find('select').length, 1)
    equal(Object.keys(wrapper.find('select').props()).length, 5) // 4 added events + children
    equal(wrapper.find('option').length, 3)

    wrapper = mount(
      <Form>
        <Validator>
          {() => <textarea>{'a very small amount of useless text'}</textarea>}
        </Validator>
      </Form>
    )
    equal(wrapper.find('textarea').length, 1)
    equal(Object.keys(wrapper.find('textarea').props()).length, 5) // 4 added events + children
  })

  it('validates properly', () => {
    const submitStub = stub()
    const wrapper = mount(
      <Form onSubmit={submitStub}>
        <Validator>
          {({ error, invalid, valid, validated }) => (
            <>
              {<div className="invalid">{invalid ? 'true' : 'false'}</div>}
              {<div className="valid">{valid ? 'true' : 'false'}</div>}
              {<div className="validated">{validated ? 'true' : 'false'}</div>}
              {<div className="error">{error ? error.code : 'null'}</div>}
              <input required />
            </>
          )}
        </Validator>
      </Form>
    )

    wrapper.find('form').simulate('submit')

    equal(submitStub.callCount, 0)
    equal(wrapper.find('.error').text(), 'valueMissing')
    equal(wrapper.find('.validated').text(), 'true')
    equal(wrapper.find('.valid').text(), 'false')
    equal(wrapper.find('.invalid').text(), 'true')

    wrapper.find('input').getDOMNode().value = 'test' // you're tearing me apart enzyme
    wrapper.find('input').simulate('blur')
    wrapper.find('form').simulate('submit')

    equal(submitStub.callCount, 1)
    equal(wrapper.find('.error').text(), 'null')
    equal(wrapper.find('.validated').text(), 'true')
    equal(wrapper.find('.valid').text(), 'true')
    equal(wrapper.find('.invalid').text(), 'false')
  })
})
