import { test, expect, apiAssertions } from '../utils/base-api';
import { TestDataGenerator } from '../utils/test-data';
import { Order, Pet } from '../types/api.types';

test.describe('Store API Tests', () => {
  let createdOrderIds: number[] = [];
  let createdPetIds: number[] = [];

  test.afterAll(async ({ apiClient }) => {
    // Cleanup: Delete created orders and pets
    for (const orderId of createdOrderIds) {
      try {
        await apiClient.delete(`/store/order/${orderId}`);
      } catch (error) {
        console.log(`Failed to cleanup order ${orderId}:`, error);
      }
    }
    
    for (const petId of createdPetIds) {
      try {
        await apiClient.delete(`/pet/${petId}`);
      } catch (error) {
        console.log(`Failed to cleanup pet ${petId}:`, error);
      }
    }
  });

  test.describe('GET /store/inventory - Returns pet inventories by status', () => {
    test('should return inventory with status counts', async ({ apiClient }) => {
      const response = await apiClient.get<Record<string, number>>('/store/inventory');
      
      apiAssertions.expectStatus(response, 200);
      expect(typeof response.data).toBe('object');
      
      // Inventory should contain status counts
      Object.values(response.data).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    test('should include common pet statuses in inventory', async ({ apiClient }) => {
      const response = await apiClient.get<Record<string, number>>('/store/inventory');
      
      apiAssertions.expectStatus(response, 200);
      
      // Check if inventory contains expected statuses
      const expectedStatuses = ['available', 'pending', 'sold'];
      const inventoryKeys = Object.keys(response.data);
      
      // At least some of the expected statuses should be present
      const hasExpectedStatuses = expectedStatuses.some(status => 
        inventoryKeys.includes(status)
      );
      expect(hasExpectedStatuses).toBe(true);
    });
  });

  test.describe('POST /store/order - Place an order for a pet', () => {
    let testPetId: number;

    test.beforeAll(async ({ apiClient }) => {
      // Create a pet for ordering
      const petData = TestDataGenerator.generatePetData();
      const response = await apiClient.post<Pet>('/pet', petData);
      testPetId = response.data.id!;
      createdPetIds.push(testPetId);
    });

    test('should successfully place an order for a pet', async ({ apiClient }) => {
      const orderData = TestDataGenerator.generateOrderData(testPetId);
      
      const response = await apiClient.post<Order>('/store/order', orderData);
      
      apiAssertions.expectStatus(response, 200);
      expect(response.data).toHaveProperty('id');
      expect(response.data.petId).toBe(testPetId);
      expect(response.data.quantity).toBe(orderData.quantity);
      expect(response.data.status).toBe(orderData.status);
      
      if (response.data.id) {
        createdOrderIds.push(response.data.id);
      }
    });

    test('should create order with complete shipDate', async ({ apiClient }) => {
      const orderData = {
        ...TestDataGenerator.generateOrderData(testPetId),
        shipDate: new Date().toISOString(),
        complete: true
      };
      
      const response = await apiClient.post<Order>('/store/order', orderData);
      
      apiAssertions.expectStatus(response, 200);
      expect(response.data.shipDate).toBeDefined();
      expect(response.data.complete).toBe(true);
      
      if (response.data.id) {
        createdOrderIds.push(response.data.id);
      }
    });

    test('should handle different order statuses', async ({ apiClient }) => {
      const statuses = TestDataGenerator.getValidOrderStatuses();
      
      for (const status of statuses) {
        const orderData = {
          ...TestDataGenerator.generateOrderData(testPetId),
          status
        };
        
        const response = await apiClient.post<Order>('/store/order', orderData);
        
        apiAssertions.expectStatus(response, 200);
        expect(response.data.status).toBe(status);
        
        if (response.data.id) {
          createdOrderIds.push(response.data.id);
        }
      }
    });
  });
});