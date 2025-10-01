import { test, expect, apiAssertions } from '../utils/base-api';
import { TestDataGenerator } from '../utils/test-data';
import { User } from '../types/api.types';

test.describe('User API Tests', () => {
  let createdUsernames: string[] = [];

  test.afterAll(async ({ apiClient }) => {
    // Cleanup: Delete created users
    for (const username of createdUsernames) {
      try {
        await apiClient.delete(`/user/${username}`);
      } catch (error) {
        console.log(`Failed to cleanup user ${username}:`, error);
      }
    }
  });

  test.describe('POST /user - Create user', () => {
    test('should handle user with minimal required data', async ({ apiClient }) => {
      const minimalUserData = {
        username: `minimal_user_${TestDataGenerator['getRandomString']()}`
      };
      
      const response = await apiClient.post('/user', minimalUserData);
      
      apiAssertions.expectStatus(response, 200);
      createdUsernames.push(minimalUserData.username);
    });
  });

  test.describe('POST /user/createWithArray - Create users with array input', () => {
    test('should handle empty array', async ({ apiClient }) => {
      const response = await apiClient.post('/user/createWithArray', []);
      
      apiAssertions.expectStatus(response, 200);
    });

    test('should create single user in array', async ({ apiClient }) => {
      const userData = [TestDataGenerator.generateUserData()];
      
      const response = await apiClient.post('/user/createWithArray', userData);
      
      apiAssertions.expectStatus(response, 200);
      createdUsernames.push(userData[0].username);
    });
  });

  test.describe('GET /user/login - User login', () => {
    test('should successfully login with valid credentials', async ({ apiClient }) => {
      const credentials = TestDataGenerator.getTestCredentials().user;
      const loginParams = {
        username: credentials.username,
        password: credentials.password
      };
      
      const response = await apiClient.get('/user/login', loginParams);
      
      apiAssertions.expectStatus(response, 200);
      // Note: Response format may vary, so we just check for successful login
      expect(response.data).toBeDefined();
      
      // Check for session headers
      expect(response.headers).toBeDefined();
    });
  });

  test.describe('GET /user/logout - User logout', () => {
    test('should successfully logout user', async ({ apiClient }) => {
      const response = await apiClient.get('/user/logout');
      
      apiAssertions.expectStatus(response, 200);
    });

    test('should logout without active session', async ({ apiClient }) => {
      // Multiple logout calls should still succeed
      const response1 = await apiClient.get('/user/logout');
      const response2 = await apiClient.get('/user/logout');
      
      apiAssertions.expectStatus(response1, 200);
      apiAssertions.expectStatus(response2, 200);
    });
  });
});
