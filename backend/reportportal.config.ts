/**
 * ReportPortal Configuration
 * 
 * This file contains the ReportPortal configuration for Jest test reporting.
 * Environment variables are loaded from .env file.
 * 
 * Usage in jest.config.js:
 * const rpConfig = require('./reportportal.config.ts');
 */

interface ReportPortalConfig {
  apiVersion: string;
  endpoint?: string;
  token?: string;
  project?: string;
  launch: string;
  attributes: Array<{ key: string; value: string }>;
  description: string;
  skippedIssue: boolean;
  autoMerge: boolean;
}

const getReportPortalConfig = (): ReportPortalConfig => {
  // Check if ReportPortal is enabled (all required vars must be set)
  const isEnabled =
    process.env.RP_ENDPOINT &&
    process.env.RP_TOKEN &&
    process.env.RP_PROJECT;

  if (!isEnabled) {
    console.warn(
      '⚠️  ReportPortal is not configured. Set RP_ENDPOINT, RP_TOKEN, and RP_PROJECT environment variables to enable it.'
    );
  }

  return {
    apiVersion: 'v2',
    endpoint: process.env.RP_ENDPOINT,
    token: process.env.RP_TOKEN,
    project: process.env.RP_PROJECT,
    launch:
      process.env.RP_LAUNCH ||
      `Jest Launch - ${new Date().toISOString()}`,
    attributes: [
      {
        key: 'environment',
        value: process.env.RP_ENV || 'development',
      },
      {
        key: 'version',
        value: process.env.RP_VERSION || '1.0.0',
      },
      {
        key: 'nodeVersion',
        value: process.version,
      },
      {
        key: 'platform',
        value: process.platform,
      },
    ],
    description: 'Jest test execution for Todo API',
    skippedIssue: false,
    autoMerge: false,
  };
};

export default getReportPortalConfig();



