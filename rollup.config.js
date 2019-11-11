import babel from 'rollup-plugin-babel'
import liveServer from 'rollup-plugin-live-server'
import { terser } from 'rollup-plugin-terser'

const isProduction = process.env.NODE_ENV === 'production'

const config = (format, file, minify, server = false) => ({
  input: './src/index.js',
  output: {
    name: 'ReactFormValidation',
    format,
    file,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes'
    }
  },
  plugins: [
    babel(),
    minify && terser(),
    server &&
      liveServer({
        port: 8001,
        host: '0.0.0.0',
        root: 'demo',
        file: 'index.html',
        mount: [
          ['/', './examples'],
          ['/dist', './dist'],
          ['/node_modules', './node_modules']
        ],
        open: false,
        wait: 500
      })
  ],
  external: ['react', 'react-dom', 'prop-types']
})

export default [
  config('umd', './dist/index.umd.js', false, !isProduction),
  config('umd', './dist/index.umd.min.js', true),
  config('module', './dist/index.min.mjs', true),
  config('module', './dist/index.mjs'),
  config('cjs', './dist/index.cjs.min.js', true),
  config('cjs', './dist/index.cjs.js')
]
