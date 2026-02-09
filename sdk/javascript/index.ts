/**
 * FarmKonnect JavaScript SDK
 * Type-safe client library for FarmKonnect tRPC API
 * 
 * @packageDocumentation
 * @example
 * ```typescript
 * import { FarmKonnectClient } from '@farmkonnect/sdk';
 * 
 * const client = new FarmKonnectClient({
 *   baseUrl: 'https://api.farmkonnect.com',
 *   token: 'your-jwt-token'
 * });
 * 
 * // List farms
 * const farms = await client.farms.list({ limit: 10 });
 * 
 * // Get crop analytics
 * const analytics = await client.crops.getAnalytics({ cropId: 1 });
 * ```
 */

export interface ClientConfig {
  baseUrl?: string;
  token?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export class FarmKonnectClient {
  private baseUrl: string;
  private token?: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  public farms: FarmsAPI;
  public crops: CropsAPI;
  public livestock: LivestockAPI;
  public breeding: BreedingAPI;
  public marketplace: MarketplaceAPI;
  public weather: WeatherAPI;
  public financial: FinancialAPI;
  public notifications: NotificationsAPI;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.token = config.token;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Initialize API modules
    this.farms = new FarmsAPI(this);
    this.crops = new CropsAPI(this);
    this.livestock = new LivestockAPI(this);
    this.breeding = new BreedingAPI(this);
    this.marketplace = new MarketplaceAPI(this);
    this.weather = new WeatherAPI(this);
    this.financial = new FinancialAPI(this);
    this.notifications = new NotificationsAPI(this);
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(
    method: string,
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options?.headers
        };

        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(options?.timeout || this.timeout)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new APIError(error.message, response.status, error);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = undefined;
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Farms API module
 */
class FarmsAPI {
  constructor(private client: FarmKonnectClient) {}

  async list(params?: { limit?: number; offset?: number }) {
    return this.client.request('/api/trpc/farms.list', 'GET', params);
  }

  async get(id: number) {
    return this.client.request(`/api/trpc/farms.get?id=${id}`, 'GET');
  }

  async create(data: any) {
    return this.client.request('/api/trpc/farms.create', 'POST', data);
  }

  async update(id: number, data: any) {
    return this.client.request(`/api/trpc/farms.update?id=${id}`, 'PUT', data);
  }

  async delete(id: number) {
    return this.client.request(`/api/trpc/farms.delete?id=${id}`, 'DELETE');
  }
}

/**
 * Crops API module
 */
class CropsAPI {
  constructor(private client: FarmKonnectClient) {}

  async list(farmId: number, params?: { status?: string }) {
    const query = new URLSearchParams({ farmId: String(farmId), ...params });
    return this.client.request(`/api/trpc/crops.list?${query}`, 'GET');
  }

  async get(id: number) {
    return this.client.request(`/api/trpc/crops.get?id=${id}`, 'GET');
  }

  async create(data: any) {
    return this.client.request('/api/trpc/crops.create', 'POST', data);
  }

  async getAnalytics(cropId: number) {
    return this.client.request(`/api/trpc/crops.getAnalytics?cropId=${cropId}`, 'GET');
  }

  async getSoilTests(cropId: number) {
    return this.client.request(`/api/trpc/crops.getSoilTests?cropId=${cropId}`, 'GET');
  }

  async getYieldRecords(cropId: number) {
    return this.client.request(`/api/trpc/crops.getYieldRecords?cropId=${cropId}`, 'GET');
  }
}

/**
 * Livestock API module
 */
class LivestockAPI {
  constructor(private client: FarmKonnectClient) {}

  async list(farmId: number, params?: { type?: string }) {
    const query = new URLSearchParams({ farmId: String(farmId), ...params });
    return this.client.request(`/api/trpc/livestock.list?${query}`, 'GET');
  }

  async get(id: number) {
    return this.client.request(`/api/trpc/livestock.get?id=${id}`, 'GET');
  }

  async create(data: any) {
    return this.client.request('/api/trpc/livestock.create', 'POST', data);
  }

  async getHealthRecords(animalId: number) {
    return this.client.request(`/api/trpc/livestock.getHealthRecords?animalId=${animalId}`, 'GET');
  }

  async addHealthRecord(data: any) {
    return this.client.request('/api/trpc/livestock.addHealthRecord', 'POST', data);
  }

  async getVaccinations(animalId: number) {
    return this.client.request(`/api/trpc/livestock.getVaccinations?animalId=${animalId}`, 'GET');
  }
}

/**
 * Breeding API module
 */
class BreedingAPI {
  constructor(private client: FarmKonnectClient) {}

  async getRecords(farmId: number) {
    return this.client.request(`/api/trpc/breeding.getRecords?farmId=${farmId}`, 'GET');
  }

  async getAnalytics(farmId: number) {
    return this.client.request(`/api/trpc/breeding.getAnalytics?farmId=${farmId}`, 'GET');
  }

  async calculateCompatibility(animal1Id: number, animal2Id: number) {
    return this.client.request(
      `/api/trpc/breeding.calculateCompatibility?animal1Id=${animal1Id}&animal2Id=${animal2Id}`,
      'GET'
    );
  }

  async getRecommendations(farmId: number) {
    return this.client.request(`/api/trpc/breeding.getRecommendations?farmId=${farmId}`, 'GET');
  }

  async createRecord(data: any) {
    return this.client.request('/api/trpc/breeding.createRecord', 'POST', data);
  }
}

/**
 * Marketplace API module
 */
class MarketplaceAPI {
  constructor(private client: FarmKonnectClient) {}

  async listProducts(params?: { search?: string; category?: string; minPrice?: number; maxPrice?: number }) {
    const query = new URLSearchParams(params as any);
    return this.client.request(`/api/trpc/marketplace.products?${query}`, 'GET');
  }

  async getProduct(id: number) {
    return this.client.request(`/api/trpc/marketplace.getProduct?id=${id}`, 'GET');
  }

  async createOrder(data: any) {
    return this.client.request('/api/trpc/marketplace.createOrder', 'POST', data);
  }

  async getOrders() {
    return this.client.request('/api/trpc/marketplace.getOrders', 'GET');
  }

  async getCart() {
    return this.client.request('/api/trpc/marketplace.getCart', 'GET');
  }

  async addToCart(productId: number, quantity: number) {
    return this.client.request('/api/trpc/marketplace.addToCart', 'POST', { productId, quantity });
  }

  async removeFromCart(productId: number) {
    return this.client.request('/api/trpc/marketplace.removeFromCart', 'POST', { productId });
  }
}

/**
 * Weather API module
 */
class WeatherAPI {
  constructor(private client: FarmKonnectClient) {}

  async getForecast(farmId: number, days?: number) {
    const query = new URLSearchParams({ farmId: String(farmId), ...(days && { days: String(days) }) });
    return this.client.request(`/api/trpc/weather.forecast?${query}`, 'GET');
  }

  async getAlerts(farmId: number) {
    return this.client.request(`/api/trpc/weather.getAlerts?farmId=${farmId}`, 'GET');
  }

  async getCropRecommendations(farmId: number) {
    return this.client.request(`/api/trpc/weather.getCropRecommendations?farmId=${farmId}`, 'GET');
  }
}

/**
 * Financial API module
 */
class FinancialAPI {
  constructor(private client: FarmKonnectClient) {}

  async getExpenses(farmId: number, params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams({ farmId: String(farmId), ...params });
    return this.client.request(`/api/trpc/financial.getExpenses?${query}`, 'GET');
  }

  async getRevenue(farmId: number, params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams({ farmId: String(farmId), ...params });
    return this.client.request(`/api/trpc/financial.getRevenue?${query}`, 'GET');
  }

  async getSummary(farmId: number, months?: number) {
    const query = new URLSearchParams({ farmId: String(farmId), ...(months && { months: String(months) }) });
    return this.client.request(`/api/trpc/financial.getSummary?${query}`, 'GET');
  }

  async addExpense(data: any) {
    return this.client.request('/api/trpc/financial.addExpense', 'POST', data);
  }

  async addRevenue(data: any) {
    return this.client.request('/api/trpc/financial.addRevenue', 'POST', data);
  }
}

/**
 * Notifications API module
 */
class NotificationsAPI {
  constructor(private client: FarmKonnectClient) {}

  async list(params?: { limit?: number; offset?: number; read?: boolean }) {
    const query = new URLSearchParams(params as any);
    return this.client.request(`/api/trpc/notifications.list?${query}`, 'GET');
  }

  async markAsRead(id: number) {
    return this.client.request(`/api/trpc/notifications.markAsRead?id=${id}`, 'POST');
  }

  async markAllAsRead() {
    return this.client.request('/api/trpc/notifications.markAllAsRead', 'POST');
  }

  async delete(id: number) {
    return this.client.request(`/api/trpc/notifications.delete?id=${id}`, 'DELETE');
  }

  async getPreferences() {
    return this.client.request('/api/trpc/notifications.getPreferences', 'GET');
  }

  async updatePreferences(data: any) {
    return this.client.request('/api/trpc/notifications.updatePreferences', 'PUT', data);
  }
}

export default FarmKonnectClient;
