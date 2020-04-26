Babel.registerPreset('babel-sucks', {
  presets: [Babel.availablePresets['es2015'], Babel.availablePresets['react']],
  plugins: [
    [
      Babel.availablePlugins['transform-modules-umd'],
      {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'prop-types': 'PropTypes',
          'react-form-validation': 'ReactFormValidation',
        },
      },
    ],
  ],
  moduleId: 'main',
})
