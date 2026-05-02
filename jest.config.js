module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  moduleNameMapper: {
    '^chalk$': '<rootDir>/tests/__mocks__/chalk.js'
  },
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/engines/openai.js',
    '!lib/engines/ollama.js',
    '!lib/meme-generator.js',
    '!lib/git.js',
    '!lib/roaster.js',
    '!lib/prompts.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      functions: 90,
      branches: 85
    }
  },
  testTimeout: 10000,
  clearMocks: true,
  resetModules: true
};
