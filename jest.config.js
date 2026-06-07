const sharedConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 30000,
  testPathIgnorePatterns: ['<rootDir>/.stryker-tmp/']
}

module.exports = {
  ...sharedConfig,
  maxWorkers: 1,
  forceExit: true,
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
  projects: [
    {
      ...sharedConfig,
      displayName: 'unit-fuzz',
      testMatch: [
        '<rootDir>/src/tests/unit/**/*.test.js',
        '<rootDir>/src/tests/fuzz/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/src/tests/setup.env.js']
    },
    {
      ...sharedConfig,
      displayName: 'integration',
      testMatch: ['<rootDir>/src/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: [
        '<rootDir>/src/tests/setup.env.js',
        '<rootDir>/src/tests/setup.js'
      ]
    }
  ]
}
