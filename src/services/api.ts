// API Service - Clean, type-safe, no more Flutter headaches!
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/config';
import storageService from './storage';
import { 
  User, 
  Goal, 
  Calendar, 
  Event, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse 
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storageService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await storageService.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
                { refresh: refreshToken }
              );

              const newAccessToken = response.data.access;
              await storageService.saveTokens({
                access: newAccessToken,
                refresh: refreshToken,
              });

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and redirect to login
            await storageService.clearAll();
            // TODO: Navigate to login screen
          }
        }

        console.error('❌ API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods (like C++ templates!)
  private async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url);
    return response.data;
  }

  private async post<T, U>(url: string, data?: U): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  private async put<T, U>(url: string, data: U): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  private async patch<T, U>(url: string, data: U): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
    return response.data;
  }

  private async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse, LoginRequest>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Save tokens and user data
    await storageService.saveTokens({
      access: response.access,
      refresh: response.refresh,
    });
    await storageService.saveUser(response.user);

    return response;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      if (refreshToken) {
        await this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storageService.clearAll();
    }
  }

  async getCurrentUser(): Promise<User> {
    return await this.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  // Goals methods
  async getGoals(): Promise<Goal[]> {
    return await this.get<Goal[]>(API_CONFIG.ENDPOINTS.GOALS);
  }

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    return await this.post<Goal, Partial<Goal>>(API_CONFIG.ENDPOINTS.GOALS, goal);
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    return await this.patch<Goal, Partial<Goal>>(
      `${API_CONFIG.ENDPOINTS.GOALS}${goalId}/`,
      updates
    );
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.GOALS}${goalId}/`);
  }

  // Quick method to toggle goal completion (the main event!)
  async toggleGoalCompletion(goalId: string, isCompleted: boolean): Promise<Goal> {
    const status = isCompleted ? 'completed' : 'active';
    return await this.updateGoal(goalId, { 
      is_completed: isCompleted, 
      status 
    });
  }

  // Calendar methods
  async getCalendars(): Promise<Calendar[]> {
    return await this.get<Calendar[]>(API_CONFIG.ENDPOINTS.CALENDARS);
  }

  async createCalendar(calendar: Partial<Calendar>): Promise<Calendar> {
    return await this.post<Calendar, Partial<Calendar>>(
      API_CONFIG.ENDPOINTS.CALENDARS, 
      calendar
    );
  }

  async updateCalendar(calendarId: string, updates: Partial<Calendar>): Promise<Calendar> {
    return await this.patch<Calendar, Partial<Calendar>>(
      `${API_CONFIG.ENDPOINTS.CALENDARS}${calendarId}/`,
      updates
    );
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.CALENDARS}${calendarId}/`);
  }

  // Events methods
  async getEvents(startDate?: string, endDate?: string, calendarId?: string): Promise<Event[]> {
    let url = API_CONFIG.ENDPOINTS.EVENTS;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (calendarId) params.append('calendar_id', calendarId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return await this.get<Event[]>(url);
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    return await this.post<Event, Partial<Event>>(API_CONFIG.ENDPOINTS.EVENTS, event);
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    return await this.patch<Event, Partial<Event>>(
      `${API_CONFIG.ENDPOINTS.EVENTS}${eventId}/`,
      updates
    );
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.delete(`${API_CONFIG.ENDPOINTS.EVENTS}${eventId}/`);
  }

  // Test connection (no more 404 errors!)
  async testConnection(): Promise<boolean> {
    try {
      await this.get(API_CONFIG.ENDPOINTS.GOALS);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;