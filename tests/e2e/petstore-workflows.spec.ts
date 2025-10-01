import { test, expect, apiAssertions } from '../utils/base-api';
import { TestDataGenerator } from '../utils/test-data';
import { Pet, User, Order } from '../types/api.types';

test.describe('Petstore E2E Workflows', () => {
  let createdResources: {
    pets: number[];
    users: string[];
    orders: number[];
  } = {
    pets: [],
    users: [],
    orders: []
  };

  test.afterAll(async ({ apiClient }) => {
    // Cleanup all created resources
    console.log('🧹 Cleaning up E2E test resources...');
    
    for (const orderId of createdResources.orders) {
      try {
        await apiClient.delete(`/store/order/${orderId}`);
      } catch (error) {
        console.log(`Failed to cleanup order ${orderId}:`, error);
      }
    }
    
    for (const petId of createdResources.pets) {
      try {
        await apiClient.delete(`/pet/${petId}`);
      } catch (error) {
        console.log(`Failed to cleanup pet ${petId}:`, error);
      }
    }
    
    for (const username of createdResources.users) {
      try {
        await apiClient.delete(`/user/${username}`);
      } catch (error) {
        console.log(`Failed to cleanup user ${username}:`, error);
      }
    }
  });

  test.describe('Complete Pet Adoption Workflow', () => {
    test('should complete full pet adoption process', async ({ apiClient }) => {
      // Step 1: Create a new pet
      const petData = TestDataGenerator.generatePetData();
      const createPetResponse = await apiClient.post<Pet>('/pet', petData);
      
      apiAssertions.expectStatus(createPetResponse, 200);
      const petId = createPetResponse.data.id!;
      createdResources.pets.push(petId);
      
      // Step 2: Verify pet is available in the store
      const findPetsResponse = await apiClient.get<Pet[]>('/pet/findByStatus', { 
        status: 'available' 
      });
      
      apiAssertions.expectStatus(findPetsResponse, 200);
      const availablePet = findPetsResponse.data.find(pet => pet.id === petId);
      expect(availablePet).toBeDefined();
      expect(availablePet!.status).toBe('available');
      
      // Step 3: Create a user (potential pet owner)
      const userData = TestDataGenerator.generateUserData();
      const createUserResponse = await apiClient.post('/user', userData);
      
      apiAssertions.expectStatus(createUserResponse, 200);
      createdResources.users.push(userData.username);
      
      // Step 4: User logs in
      const loginResponse = await apiClient.get<string>('/user/login', {
        username: userData.username,
        password: userData.password
      });
      
      apiAssertions.expectStatus(loginResponse, 200);
      
      // Step 5: Place an order for the pet
      const orderData = TestDataGenerator.generateOrderData(petId);
      const createOrderResponse = await apiClient.post<Order>('/store/order', orderData);
      
      apiAssertions.expectStatus(createOrderResponse, 200);
      const orderId = createOrderResponse.data.id!;
      createdResources.orders.push(orderId);
      
      // Step 6: Update pet status to 'pending' (adoption in progress)
      const updatePetData = {
        ...createPetResponse.data,
        status: 'pending' as const
      };
      const updatePetResponse = await apiClient.put<Pet>('/pet', updatePetData);
      
      apiAssertions.expectStatus(updatePetResponse, 200);
      expect(updatePetResponse.data.status).toBe('pending');
      
      // Step 7: Verify order details
      const getOrderResponse = await apiClient.get<Order>(`/store/order/${orderId}`);
      
      apiAssertions.expectStatus(getOrderResponse, 200);
      expect(getOrderResponse.data.petId).toBe(petId);
      expect(getOrderResponse.data.status).toBe('placed');
      
      // Step 8: Complete the adoption (update pet status to 'sold')
      const finalPetData = {
        ...updatePetResponse.data,
        status: 'sold' as const
      };
      const finalUpdateResponse = await apiClient.put<Pet>('/pet', finalPetData);
      
      apiAssertions.expectStatus(finalUpdateResponse, 200);
      expect(finalUpdateResponse.data.status).toBe('sold');
      
      // Step 9: Verify pet is no longer available
      const finalPetsResponse = await apiClient.get<Pet[]>('/pet/findByStatus', { 
        status: 'available' 
      });
      
      apiAssertions.expectStatus(finalPetsResponse, 200);
      const stillAvailable = finalPetsResponse.data.find(pet => pet.id === petId);
      expect(stillAvailable).toBeUndefined();
    });
  });

  test.describe('Multi-Pet Store Management Workflow', () => {
    test('should manage multiple pets with different statuses', async ({ apiClient }) => {
      const petStatuses: Pet['status'][] = ['available', 'pending', 'sold'];
      const createdPets: Pet[] = [];
      
      // Step 1: Create multiple pets with different statuses
      for (const status of petStatuses) {
        const petData = { ...TestDataGenerator.generatePetData(), status };
        const response = await apiClient.post<Pet>('/pet', petData);
        
        apiAssertions.expectStatus(response, 200);
        createdPets.push(response.data);
        createdResources.pets.push(response.data.id!);
      }
      
      // Step 2: Verify pets can be found by their respective statuses
      for (const status of petStatuses) {
        const findResponse = await apiClient.get<Pet[]>('/pet/findByStatus', { status });
        
        apiAssertions.expectStatus(findResponse, 200);
        const petsWithStatus = createdPets.filter(pet => pet.status === status);
        
        for (const pet of petsWithStatus) {
          const foundPet = findResponse.data.find(p => p.id === pet.id);
          expect(foundPet).toBeDefined();
          expect(foundPet!.status).toBe(status);
        }
      }
      
      // Step 3: Check inventory reflects the pets
      const inventoryResponse = await apiClient.get<Record<string, number>>('/store/inventory');
      
      apiAssertions.expectStatus(inventoryResponse, 200);
      expect(typeof inventoryResponse.data).toBe('object');
      
      // Verify inventory contains our status categories
      petStatuses.forEach(status => {
        if (status in inventoryResponse.data) {
          expect(inventoryResponse.data[status]).toBeGreaterThanOrEqual(1);
        }
      });
      
      // Step 4: Update all pets to 'available' status
      for (const pet of createdPets) {
        const updatedPetData = { ...pet, status: 'available' as const };
        const updateResponse = await apiClient.put<Pet>('/pet', updatedPetData);
        
        apiAssertions.expectStatus(updateResponse, 200);
        expect(updateResponse.data.status).toBe('available');
      }
      
      // Step 5: Verify all pets are now available
      const availablePetsResponse = await apiClient.get<Pet[]>('/pet/findByStatus', { 
        status: 'available' 
      });
      
      apiAssertions.expectStatus(availablePetsResponse, 200);
      
      for (const pet of createdPets) {
        const foundPet = availablePetsResponse.data.find(p => p.id === pet.id);
        expect(foundPet).toBeDefined();
        expect(foundPet!.status).toBe('available');
      }
    });
  });

  test.describe('User Management and Order Processing Workflow', () => {
    test('should handle multiple users with orders', async ({ apiClient }) => {
      const numberOfUsers = 3;
      const users: User[] = [];
      const pets: Pet[] = [];
      const orders: Order[] = [];
      
      // Step 1: Create multiple users
      for (let i = 0; i < numberOfUsers; i++) {
        const userData = TestDataGenerator.generateUserData();
        const userResponse = await apiClient.post('/user', userData);
        
        apiAssertions.expectStatus(userResponse, 200);
        createdResources.users.push(userData.username);
        
        // Verify user creation
        const getUserResponse = await apiClient.get<User>(`/user/${userData.username}`);
        apiAssertions.expectStatus(getUserResponse, 200);
        users.push(getUserResponse.data);
      }
      
      // Step 2: Create pets for each user to order
      for (let i = 0; i < numberOfUsers; i++) {
        const petData = TestDataGenerator.generatePetData();
        const petResponse = await apiClient.post<Pet>('/pet', petData);
        
        apiAssertions.expectStatus(petResponse, 200);
        pets.push(petResponse.data);
        createdResources.pets.push(petResponse.data.id!);
      }
      
      // Step 3: Each user places an order
      for (let i = 0; i < numberOfUsers; i++) {
        const orderData = TestDataGenerator.generateOrderData(pets[i].id);
        const orderResponse = await apiClient.post<Order>('/store/order', orderData);
        
        apiAssertions.expectStatus(orderResponse, 200);
        orders.push(orderResponse.data);
        createdResources.orders.push(orderResponse.data.id!);
      }
      
      // Step 4: Verify all orders exist and are correct
      for (let i = 0; i < numberOfUsers; i++) {
        const getOrderResponse = await apiClient.get<Order>(`/store/order/${orders[i].id}`);
        
        apiAssertions.expectStatus(getOrderResponse, 200);
        expect(getOrderResponse.data.petId).toBe(pets[i].id);
        expect(getOrderResponse.data.status).toBe('placed');
      }
      
      // Step 5: Update user information
      for (let i = 0; i < numberOfUsers; i++) {
        const updatedUserData = {
          ...users[i],
          firstName: `Updated_${users[i].firstName}`,
          userStatus: 2
        };
        
        const updateUserResponse = await apiClient.put(
          `/user/${users[i].username}`, 
          updatedUserData
        );
        
        apiAssertions.expectStatus(updateUserResponse, 200);
        
        // Verify update
        const getUpdatedUserResponse = await apiClient.get<User>(`/user/${users[i].username}`);
        expect(getUpdatedUserResponse.data.firstName).toBe(updatedUserData.firstName);
        expect(getUpdatedUserResponse.data.userStatus).toBe(2);
      }
      
      // Step 6: Process orders (approve them)
      // Note: The API doesn't have an order update endpoint, so we simulate by checking status
      for (const order of orders) {
        const getOrderResponse = await apiClient.get<Order>(`/store/order/${order.id}`);
        apiAssertions.expectStatus(getOrderResponse, 200);
        expect(getOrderResponse.data.status).toBeDefined();
      }
    });
  });

  test.describe('Bulk Operations Workflow', () => {
    test('should handle bulk user creation and management', async ({ apiClient }) => {
      // Step 1: Create multiple users using createWithArray
      const usersData = [
        TestDataGenerator.generateUserData(),
        TestDataGenerator.generateUserData(),
        TestDataGenerator.generateUserData(),
        TestDataGenerator.generateUserData()
      ];
      
      const createUsersResponse = await apiClient.post('/user/createWithArray', usersData);
      
      apiAssertions.expectStatus(createUsersResponse, 200);
      usersData.forEach(user => createdResources.users.push(user.username));
      
      // Step 2: Verify all users were created
      for (const userData of usersData) {
        const getUserResponse = await apiClient.get<User>(`/user/${userData.username}`);
        apiAssertions.expectStatus(getUserResponse, 200);
        expect(getUserResponse.data.username).toBe(userData.username);
      }
      
      // Step 3: Create additional users using createWithList
      const moreUsersData = [
        TestDataGenerator.generateUserData(),
        TestDataGenerator.generateUserData()
      ];
      
      const createMoreUsersResponse = await apiClient.post('/user/createWithList', moreUsersData);
      
      apiAssertions.expectStatus(createMoreUsersResponse, 200);
      moreUsersData.forEach(user => createdResources.users.push(user.username));
      
      // Step 4: Test login/logout cycle for multiple users
      const allUsers = [...usersData, ...moreUsersData];
      
      for (const userData of allUsers.slice(0, 2)) { // Test first 2 users
        // Login
        const loginResponse = await apiClient.get<string>('/user/login', {
          username: userData.username,
          password: userData.password
        });
        
        apiAssertions.expectStatus(loginResponse, 200);
        
        // Logout
        const logoutResponse = await apiClient.get('/user/logout');
        apiAssertions.expectStatus(logoutResponse, 200);
      }
      
      // Step 5: Update multiple users
      for (const userData of allUsers.slice(0, 3)) { // Update first 3 users
        const updatedData = {
          ...userData,
          firstName: `Bulk_Updated_${userData.firstName}`,
          userStatus: 3
        };
        
        const updateResponse = await apiClient.put(`/user/${userData.username}`, updatedData);
        apiAssertions.expectStatus(updateResponse, 200);
      }
      
      // Step 6: Verify updates
      for (const userData of allUsers.slice(0, 3)) {
        const getUserResponse = await apiClient.get<User>(`/user/${userData.username}`);
        expect(getUserResponse.data.firstName).toContain('Bulk_Updated_');
        expect(getUserResponse.data.userStatus).toBe(3);
      }
    });
  });

  test.describe('Error Handling and Recovery Workflow', () => {
    test('should handle errors gracefully and recover', async ({ apiClient }) => {
      // Step 1: Try to get non-existent pet
      const nonExistentPetResponse = await apiClient.get('/pet/999999999');
      apiAssertions.expectErrorResponse(nonExistentPetResponse, 404);
      
      // Step 2: Create a valid pet after error
      const petData = TestDataGenerator.generatePetData();
      const createPetResponse = await apiClient.post<Pet>('/pet', petData);
      
      apiAssertions.expectStatus(createPetResponse, 200);
      const petId = createPetResponse.data.id!;
      createdResources.pets.push(petId);
      
      // Step 3: Try to create order with invalid pet ID, then create valid order
      const invalidOrderData = TestDataGenerator.generateOrderData(999999999);
      const invalidOrderResponse = await apiClient.post('/store/order', invalidOrderData);
      
      // This might succeed or fail depending on API validation
      if (invalidOrderResponse.status >= 400) {
        // Create valid order after error
        const validOrderData = TestDataGenerator.generateOrderData(petId);
        const validOrderResponse = await apiClient.post<Order>('/store/order', validOrderData);
        
        apiAssertions.expectStatus(validOrderResponse, 200);
        createdResources.orders.push(validOrderResponse.data.id!);
      }
      
      // Step 4: Try to update non-existent user, then create and update valid user
      const nonExistentUserData = TestDataGenerator.generateUserData();
      const updateNonExistentResponse = await apiClient.put(
        '/user/non_existent_user_999999', 
        nonExistentUserData
      );
      
      apiAssertions.expectErrorResponse(updateNonExistentResponse, 404);
      
      // Create valid user
      const validUserData = TestDataGenerator.generateUserData();
      const createUserResponse = await apiClient.post('/user', validUserData);
      
      apiAssertions.expectStatus(createUserResponse, 200);
      createdResources.users.push(validUserData.username);
      
      // Update the valid user
      const updatedUserData = {
        ...validUserData,
        firstName: 'RecoveredUpdate'
      };
      const updateValidUserResponse = await apiClient.put(
        `/user/${validUserData.username}`, 
        updatedUserData
      );
      
      apiAssertions.expectStatus(updateValidUserResponse, 200);
      
      // Step 5: Verify system state is consistent after errors
      const getPetResponse = await apiClient.get<Pet>(`/pet/${petId}`);
      apiAssertions.expectStatus(getPetResponse, 200);
      
      const getUserResponse = await apiClient.get<User>(`/user/${validUserData.username}`);
      apiAssertions.expectStatus(getUserResponse, 200);
      expect(getUserResponse.data.firstName).toBe('RecoveredUpdate');
    });
  });
});
