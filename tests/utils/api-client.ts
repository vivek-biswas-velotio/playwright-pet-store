import { APIRequestContext, request } from '@playwright/test';
import { ApiClientResponse, TestConfig } from '../types/api.types';

export class ApiClient {
  private context: APIRequestContext | null = null;
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.config.baseUrl,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api_key': this.config.apiKey
      },
      timeout: this.config.timeout
    });
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  private getFullUrl(endpoint: string): string {
    return `${this.config.apiBasePath}${endpoint}`;
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiClientResponse<T>> {
    if (!this.context) throw new Error('API client not initialized');
    
    let url = this.getFullUrl(endpoint);
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await this.context.get(url);
    const data = await this.parseResponse<T>(response);
    
    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiClientResponse<T>> {
    if (!this.context) throw new Error('API client not initialized');
    
    const response = await this.context.post(this.getFullUrl(endpoint), {
      data: body
    });
    const data = await this.parseResponse<T>(response);
    
    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiClientResponse<T>> {
    if (!this.context) throw new Error('API client not initialized');
    
    const response = await this.context.put(this.getFullUrl(endpoint), {
      data: body
    });
    const data = await this.parseResponse<T>(response);
    
    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }

  async delete<T = any>(endpoint: string): Promise<ApiClientResponse<T>> {
    if (!this.context) throw new Error('API client not initialized');
    
    const response = await this.context.delete(this.getFullUrl(endpoint));
    const data = await this.parseResponse<T>(response);
    
    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }

  async postFormData<T = any>(endpoint: string, formData: Record<string, any>): Promise<ApiClientResponse<T>> {
    if (!this.context) throw new Error('API client not initialized');
    
    const response = await this.context.post(this.getFullUrl(endpoint), {
      form: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const data = await this.parseResponse<T>(response);
    
    return {
      status: response.status(),
      data,
      headers: response.headers()
    };
  }

  private async parseResponse<T>(response: any): Promise<T> {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  }
}
