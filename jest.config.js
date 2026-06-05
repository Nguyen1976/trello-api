module.exports = {

  testEnvironment: 'node',

  transform: {

    '^.+\\.js$': 'babel-jest'

  },

  moduleNameMapper: {

    '^~/(.*)$': '<rootDir>/src/$1'

  },

  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/utils/authUtils.js',
    'src/utils/boardUtils.js',
    'src/utils/cardUtils.js',
    'src/middlewares/authMiddleware.js',
    'src/validations/userValidation.js',
    'src/validations/boardValidation.js',
    'src/validations/columnValidation.js',
    'src/validations/cardValidation.js'
  ],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    }
  },

  testMatch: ['**/tests/**/*.test.js'],

  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],

  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true
}

