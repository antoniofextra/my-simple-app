/** @type {import('jest').Config} */
require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: (() => {
    const reporters = ['default'];
    
    // Only add ReportPortal reporter if all required environment variables are set
    if (process.env.RP_ENDPOINT && process.env.RP_TOKEN && process.env.RP_PROJECT) {
      reporters.push([
        '@reportportal/agent-js-jest',
        {
          apiVersion: 'v2',
          endpoint: process.env.RP_ENDPOINT,
          token: process.env.RP_TOKEN,
          project: process.env.RP_PROJECT,
          launch: process.env.RP_LAUNCH || 'Jest Launch',
          attributes: [
            {
              key: 'environment',
              value: process.env.RP_ENV || 'development',
            },
            {
              key: 'version',
              value: process.env.RP_VERSION || '1.0.0',
            },
          ],
          description: 'Jest test execution for Todo API',
          skippedIssue: false,
          autoMerge: false,
        },
      ]);
    } else if (process.env.RP_ENDPOINT || process.env.RP_TOKEN || process.env.RP_PROJECT) {
      // Warn if only partial credentials are set
      console.warn(
        '\n⚠️  ReportPortal is partially configured.\n' +
        'Missing required variables:\n' +
        (process.env.RP_ENDPOINT ? '' : '  - RP_ENDPOINT\n') +
        (process.env.RP_TOKEN ? '' : '  - RP_TOKEN\n') +
        (process.env.RP_PROJECT ? '' : '  - RP_PROJECT\n') +
        'Please set all three to enable ReportPortal reporting.\n'
      );
    }
    
    return reporters;
  })(),
}

