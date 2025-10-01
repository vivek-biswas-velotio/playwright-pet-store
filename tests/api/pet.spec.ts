import { test, expect, apiAssertions } from '../utils/base-api';
import { TestDataGenerator } from '../utils/test-data';
import { Pet } from '../types/api.types';

test.describe('Pet API Tests', () => {
  let createdPetIds: number[] = [];

  test.afterAll(async ({ apiClient }) => {
    // Cleanup: Delete created pets
    for (const petId of createdPetIds) {
      try {
        await apiClient.delete(`/pet/${petId}`);
      } catch (error) {
        console.log(`Failed to cleanup pet ${petId}:`, error);
      }
    }
  });

  test.describe('POST /pet - Add a new pet', () => {
    test('should successfully create a new pet with valid data', async ({ apiClient }) => {
      const petData = TestDataGenerator.generatePetData();
      
      const response = await apiClient.post<Pet>('/pet', petData);
      
      apiAssertions.expectStatus(response, 200);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(petData.name);
      expect(response.data.photoUrls).toEqual(petData.photoUrls);
      expect(response.data.status).toBe(petData.status);
      
      if (response.data.id) {
        createdPetIds.push(response.data.id);
      }
    });

    test('should handle pet with category and tags', async ({ apiClient }) => {
      const petData = TestDataGenerator.generatePetData();
      
      const response = await apiClient.post<Pet>('/pet', petData);
      
      apiAssertions.expectStatus(response, 200);
      expect(response.data.category).toEqual(petData.category);
      expect(response.data.tags).toEqual(petData.tags);
      
      if (response.data.id) {
        createdPetIds.push(response.data.id);
      }
    });
  });

  test.describe('PUT /pet - Update an existing pet', () => {
    let testPetId: number;

    test.beforeAll(async ({ apiClient }) => {
      // Create a pet for testing
      const petData = TestDataGenerator.generatePetData();
      const response = await apiClient.post<Pet>('/pet', petData);
      testPetId = response.data.id!;
      createdPetIds.push(testPetId);
    });

    test('should successfully update existing pet', async ({ apiClient }) => {
      const updatedPetData = {
        ...TestDataGenerator.generatePetData(),
        id: testPetId,
        status: 'sold' as const
      };
      
      const response = await apiClient.put<Pet>('/pet', updatedPetData);
      
      apiAssertions.expectStatus(response, 200);
      expect(response.data.id).toBe(testPetId);
      expect(response.data.status).toBe('sold');
    });
  });

  test.describe('GET /pet/findByStatus - Find pets by status', () => {
    test('should return pets with available status', async ({ apiClient }) => {
      const response = await apiClient.get<Pet[]>('/pet/findByStatus', { status: 'available' });
      
      apiAssertions.expectStatus(response, 200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(pet => {
          expect(pet.status).toBe('available');
        });
      }
    });

    test('should return pets with multiple statuses', async ({ apiClient }) => {
      const statuses = ['available', 'pending'];
      const response = await apiClient.get<Pet[]>('/pet/findByStatus', { status: statuses });
      
      apiAssertions.expectStatus(response, 200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        response.data.forEach(pet => {
          expect(statuses).toContain(pet.status);
        });
      }
    });
  });
});