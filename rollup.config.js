import babel from 'rollup-plugin-babel'

const config = (format, file) => ({
  input: './src/index.js',
  output: {
    name: 'yarfl',
    format,
    file,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },
  plugins: [babel()],
  external: ['react', 'react-dom']
})

export default [
  config('umd', './dist/index.umd.js'),
  config('module', './dist/index.mjs'),
  config('cjs', './dist/index.cjs.js')
]
