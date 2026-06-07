const baseConfig = require('./jest.config.js')

module.exports = {
  ...baseConfig,
  projects: undefined,
  testMatch: [
    '<rootDir>/src/tests/unit/**/*.test.js',
    '<rootDir>/src/tests/fuzz/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.env.js']
}
