import { test as base, expect } from '@playwright/test';
import { ApiClient } from './api-client';
import { TestConfig } from '../types/api.types';

// Test configuration
const testConfig: TestConfig = {
  baseUrl: process.env.BASE_URL || 'https://petstore.swagger.io',
  apiBasePath: process.env.API_BASE_PATH || '/v2',
  apiKey: process.env.API_KEY || 'special-key',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  retryCount: parseInt(process.env.RETRY_COUNT || '3')
};

// Extend Playwright test with API client
export const test = base.extend<{ apiClient: ApiClient }>({
  apiClient: async ({}, use) => {
    const client = new ApiClient(testConfig);
    await client.init();
    await use(client);
    await client.dispose();
  }
});

// Export expect for convenience
export { expect };

// Custom assertion helpers
export const apiAssertions = {
  /**
   * Assert that API response has expected status code
   */
  expectStatus(response: { status: number }, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
  },

  /**
   * Assert that API response contains expected properties
   */
  expectResponseToHaveProperties(response: { data: any }, properties: string[]) {
    properties.forEach(prop => {
      expect(response.data).toHaveProperty(prop);
    });
  },

  /**
   * Assert that API response data matches expected structure
   */
  expectResponseStructure(response: { data: any }, expectedStructure: Record<string, any>) {
    Object.entries(expectedStructure).forEach(([key, expectedType]) => {
      expect(response.data).toHaveProperty(key);
      if (expectedType !== null) {
        expect(typeof response.data[key]).toBe(expectedType);
      }
    });
  },

  /**
   * Assert that API error response has proper error structure
   */
  expectErrorResponse(response: { status: number; data: any }, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
    // Petstore API returns different error formats, so we check for common patterns
    const hasErrorStructure = 
      response.data?.message || 
      response.data?.error || 
      typeof response.data === 'string';
    expect(hasErrorStructure).toBeTruthy();
  }
};
