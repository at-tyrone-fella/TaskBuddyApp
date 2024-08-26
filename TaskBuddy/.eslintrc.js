module.exports = {
  extends: ['airbnb', 'airbnb/hooks'],
  plugins: ['react', 'jsx-a11y'],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
  },
};
