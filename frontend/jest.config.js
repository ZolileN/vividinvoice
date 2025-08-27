module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // File extensions to include
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Test files pattern
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  
  // Module name mapper for path aliases and static assets
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Transform settings
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          '@babel/preset-react',
        ],
        plugins: [
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    ],
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts',
    '!src/test-utils.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(antd|@ant-design|rc-.*|@babel/runtime)/)',
  ],
  
  // Module paths
  modulePaths: ['<rootDir>/src'],
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Test URL
  testURL: 'http://localhost',
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Global setup/teardown
  // globalSetup: '<rootDir>/src/test/globalSetup.ts',
  // globalTeardown: '<rootDir>/src/test/globalTeardown.ts',
  
  // Test timeout
  testTimeout: 10000,
};
