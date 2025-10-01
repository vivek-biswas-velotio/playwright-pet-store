// API Response Types based on Swagger Petstore API

export interface ApiResponse {
  code: number;
  type: string;
  message: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: 'available' | 'pending' | 'sold';
}

export interface Order {
  id?: number;
  petId: number;
  quantity: number;
  shipDate?: string;
  status?: 'placed' | 'approved' | 'delivered';
  complete?: boolean;
}

export interface User {
  id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  userStatus?: number;
}

// Test Data Interfaces
export interface TestPetData {
  name: string;
  photoUrls: string[];
  category?: Category;
  tags?: Tag[];
  status?: Pet['status'];
}

export interface TestUserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userStatus: number;
}

export interface TestOrderData {
  petId: number;
  quantity: number;
  status?: Order['status'];
  complete?: boolean;
}

// API Client Response Types
export interface ApiClientResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

// Test Configuration
export interface TestConfig {
  baseUrl: string;
  apiBasePath: string;
  apiKey: string;
  timeout: number;
  retryCount: number;
}
