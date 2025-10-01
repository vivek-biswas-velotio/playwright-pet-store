import { Pet, User, Order, Category, Tag, TestPetData, TestUserData, TestOrderData } from '../types/api.types';

export class TestDataGenerator {
  private static getRandomId(): number {
    return Math.floor(Math.random() * 10000) + 1000;
  }

  private static getRandomString(length: number = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateCategory(): Category {
    return {
      id: this.getRandomId(),
      name: `category_${this.getRandomString()}`
    };
  }

  static generateTag(): Tag {
    return {
      id: this.getRandomId(),
      name: `tag_${this.getRandomString()}`
    };
  }

  static generatePetData(): TestPetData {
    return {
      name: `pet_${this.getRandomString()}`,
      photoUrls: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg'
      ],
      category: this.generateCategory(),
      tags: [this.generateTag()],
      status: 'available'
    };
  }

  static generatePet(): Pet {
    const petData = this.generatePetData();
    return {
      id: this.getRandomId(),
      ...petData
    };
  }

  static generateUserData(): TestUserData {
    const username = `user_${this.getRandomString()}`;
    return {
      username,
      firstName: `FirstName_${this.getRandomString(5)}`,
      lastName: `LastName_${this.getRandomString(5)}`,
      email: `${username}@example.com`,
      password: `password_${this.getRandomString()}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      userStatus: 1
    };
  }

  // Get predefined test credentials for login testing
  static getTestCredentials() {
    return {
      user: {
        username: process.env.TEST_USER_USERNAME || 'user1',
        password: process.env.TEST_USER_PASSWORD || 'password'
      },
      admin: {
        username: process.env.TEST_ADMIN_USERNAME || 'admin',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
      }
    };
  }

  static generateUser(): User {
    const userData = this.generateUserData();
    return {
      id: this.getRandomId(),
      ...userData
    };
  }

  static generateOrderData(petId?: number): TestOrderData {
    return {
      petId: petId || this.getRandomId(),
      quantity: Math.floor(Math.random() * 5) + 1,
      status: 'placed',
      complete: false
    };
  }

  static generateOrder(petId?: number): Order {
    const orderData = this.generateOrderData(petId);
    return {
      id: this.getRandomId(),
      shipDate: new Date().toISOString(),
      ...orderData
    };
  }

  // Predefined test data for consistent testing
  static getValidPetStatuses(): Pet['status'][] {
    return ['available', 'pending', 'sold'];
  }

  static getValidOrderStatuses(): Order['status'][] {
    return ['placed', 'approved', 'delivered'];
  }

  // Invalid data for negative testing
  static getInvalidPetData() {
    return {
      // Missing required fields
      missingName: {
        photoUrls: ['https://example.com/photo.jpg']
      },
      missingPhotoUrls: {
        name: 'TestPet'
      },
      // Invalid status
      invalidStatus: {
        name: 'TestPet',
        photoUrls: ['https://example.com/photo.jpg'],
        status: 'invalid_status'
      }
    };
  }

  static getInvalidUserData() {
    return {
      // Missing username
      missingUsername: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      },
      // Invalid email format
      invalidEmail: {
        username: 'testuser',
        email: 'invalid-email'
      }
    };
  }

  // Test data for boundary testing
  static getBoundaryTestData() {
    return {
      longStrings: {
        name: 'a'.repeat(1000),
        username: 'u'.repeat(500)
      },
      specialCharacters: {
        name: 'Pet@#$%^&*()',
        username: 'user!@#$%'
      },
      emptyStrings: {
        name: '',
        username: ''
      }
    };
  }
}
