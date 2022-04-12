const config = {
  testEnvironment: "node",
  collectCoverage: true,
  resetModules: true,
  testMatch: ['/**/**.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  coveragePathIgnorePatterns: [
      'node_modules',
      'dist',
  ],
  verbose: true
}

module.exports = () => {
  return config
}