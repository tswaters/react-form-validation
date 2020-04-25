require('@babel/register')

const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
Enzyme.configure({ adapter: new Adapter() })

const { JSDOM } = require('jsdom')
const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const { window } = jsdom

global.window = window
global.document = window.document
global.navigator = { userAgent: 'node.js' }
global.requestAnimationFrame = (callback) => setTimeout(callback, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)

Object.defineProperties(window, {
  ...Object.getOwnPropertyDescriptors(global),
  ...Object.getOwnPropertyDescriptors(window),
})

const sinon = require('sinon')
beforeEach(() => sinon.stub(console, 'error'))
afterEach(() => console.error.restore())
