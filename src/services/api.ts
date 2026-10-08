import { DumperTruck, DispatchRun, SafetyAlert, User, FleetStats } from '../types.js';

const BASE_URL = '/api';

export class ApiClient {
  private static async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errMsg = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errMsg = errorJson.error;
      } catch {
        // use fallback message
      }
      throw new Error(errMsg);
    }

    return res.json();
  }

  // --- Auth ---
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    siteId?: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getDemoUsers(): Promise<User[]> {
    return this.request('/auth/demo-users');
  }

  // --- Trucks ---
  static async getTrucks(): Promise<DumperTruck[]> {
    return this.request('/fleet/trucks');
  }

  static async getTruck(id: string): Promise<DumperTruck> {
    return this.request(`/fleet/trucks/${id}`);
  }

  static async createTruck(truck: Partial<DumperTruck>): Promise<DumperTruck> {
    return this.request('/fleet/trucks', {
      method: 'POST',
      body: JSON.stringify(truck),
    });
  }

  static async updateTruck(id: string, updates: Partial<DumperTruck>): Promise<DumperTruck> {
    return this.request(`/fleet/trucks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async updateTruckStatus(
    id: string,
    data: {
      status?: DumperTruck['status'];
      currentLocation?: string;
      destination?: string;
      currentPayloadTons?: number;
      hydraulicBedAngleDeg?: number;
    }
  ): Promise<DumperTruck> {
    return this.request(`/fleet/trucks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteTruck(id: string): Promise<{ message: string }> {
    return this.request(`/fleet/trucks/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Dispatches ---
  static async getDispatches(): Promise<DispatchRun[]> {
    return this.request('/fleet/dispatches');
  }

  static async createDispatch(dispatch: Partial<DispatchRun>): Promise<DispatchRun> {
    return this.request('/fleet/dispatches', {
      method: 'POST',
      body: JSON.stringify(dispatch),
    });
  }

  // --- Alerts ---
  static async getAlerts(): Promise<SafetyAlert[]> {
    return this.request('/fleet/alerts');
  }

  static async createAlert(alert: Omit<SafetyAlert, 'id' | 'timestamp' | 'resolved'>): Promise<SafetyAlert> {
    return this.request('/fleet/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  static async resolveAlert(id: string): Promise<{ message: string }> {
    return this.request(`/fleet/alerts/${id}/resolve`, {
      method: 'PATCH',
    });
  }

  // --- Stats ---
  static async getStats(): Promise<FleetStats> {
    return this.request('/fleet/stats');
  }

  static async resetDatabase(): Promise<{ message: string }> {
    return this.request('/fleet/reset', {
      method: 'POST',
    });
  }
}
