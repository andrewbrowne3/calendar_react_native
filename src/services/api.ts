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
    // Mock login for testing - accept any credentials
    console.log('Mock login for:', credentials.email);
    
    // Simulate a small delay to make it feel real
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create mock response
    const mockResponse: LoginResponse = {
      access: 'mock-access-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
      user: {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };

    try {
      // Save tokens and user data
      await storageService.saveTokens({
        access: mockResponse.access,
        refresh: mockResponse.refresh,
      });
      await storageService.saveUser(mockResponse.user);
    } catch (error) {
      console.error('Error saving auth data:', error);
      // Continue anyway for testing
    }

    return mockResponse;
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

  // Goals methods - Mock implementation with persistent storage
  async getGoals(): Promise<Goal[]> {
    try {
      // Try to get stored goals first
      const storedGoals = await storageService.getItem('mock_goals');
      if (storedGoals) {
        return JSON.parse(storedGoals);
      }
      
      // If no stored goals, return default mock goals and save them
      const defaultGoals: Goal[] = [
        {
          id: '1',
          title: 'Morning Workout',
          description: 'Complete 30 min cardio session',
          frequency: 'daily',
          priority: 'high',
          status: 'active',
          target_value: 30,
          current_value: 0,
          unit: 'minutes',
          start_date: new Date().toISOString().split('T')[0],
          color: '#4CAF50',
          is_active: true,
          is_completed: false,
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Read 20 Pages',
          description: 'Continue reading current book',
          frequency: 'daily',
          priority: 'medium',
          status: 'active',
          target_value: 20,
          current_value: 5,
          unit: 'pages',
          start_date: new Date().toISOString().split('T')[0],
          color: '#2196F3',
          is_active: true,
          is_completed: false,
          progress_percentage: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Complete Project Tasks',
          description: 'Finish pending development tasks',
          frequency: 'weekly',
          priority: 'high',
          status: 'completed',
          target_value: 5,
          current_value: 5,
          unit: 'tasks',
          start_date: new Date().toISOString().split('T')[0],
          color: '#FF9800',
          is_active: true,
          is_completed: true,
          progress_percentage: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      // Save default goals to storage
      await storageService.saveItem('mock_goals', JSON.stringify(defaultGoals));
      return defaultGoals;
    } catch (error) {
      console.error('Error loading goals:', error);
      return [];
    }
  }

  async createGoal(goalData: Partial<Goal>): Promise<Goal> {
    try {
      console.log('Creating goal with data:', goalData);
      
      // Get existing goals
      const existingGoals = await this.getGoals();
      
      // Create new goal with generated ID
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: goalData.title || '',
        description: goalData.description,
        frequency: goalData.frequency || 'daily',
        priority: goalData.priority || 'medium',
        status: goalData.status || 'active',
        target_value: goalData.target_value,
        current_value: goalData.current_value || 0,
        unit: goalData.unit,
        start_date: goalData.start_date || new Date().toISOString().split('T')[0],
        end_date: goalData.end_date,
        color: goalData.color || '#4CAF50',
        is_active: goalData.is_active !== undefined ? goalData.is_active : true,
        is_completed: goalData.is_completed || false,
        progress_percentage: goalData.target_value && goalData.current_value 
          ? Math.min(100, (goalData.current_value / goalData.target_value) * 100)
          : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add to existing goals
      const updatedGoals = [...existingGoals, newGoal];
      
      // Save to storage
      await storageService.saveItem('mock_goals', JSON.stringify(updatedGoals));
      
      console.log('✅ Goal created successfully:', newGoal.title);
      return newGoal;
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    try {
      console.log('Updating goal:', goalId, 'with updates:', updates);
      
      // Get existing goals
      const existingGoals = await this.getGoals();
      
      // Find the goal to update
      const goalIndex = existingGoals.findIndex(goal => goal.id === goalId);
      if (goalIndex === -1) {
        throw new Error('Goal not found');
      }
      
      // Update the goal
      const updatedGoal: Goal = {
        ...existingGoals[goalIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Recalculate progress percentage if target or current value changed
      if (updatedGoal.target_value && updatedGoal.current_value !== undefined) {
        updatedGoal.progress_percentage = Math.min(100, (updatedGoal.current_value / updatedGoal.target_value) * 100);
      }
      
      // Update the goals array
      existingGoals[goalIndex] = updatedGoal;
      
      // Save to storage
      await storageService.saveItem('mock_goals', JSON.stringify(existingGoals));
      
      console.log('✅ Goal updated successfully:', updatedGoal.title);
      return updatedGoal;
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      console.log('Deleting goal:', goalId);
      
      // Get existing goals
      const existingGoals = await this.getGoals();
      
      // Filter out the goal to delete
      const updatedGoals = existingGoals.filter(goal => goal.id !== goalId);
      
      if (updatedGoals.length === existingGoals.length) {
        throw new Error('Goal not found');
      }
      
      // Save to storage
      await storageService.saveItem('mock_goals', JSON.stringify(updatedGoals));
      
      console.log('✅ Goal deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
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
    // Return mock calendars for testing
    return [
      {
        id: '1',
        name: 'Personal',
        color: '#2196F3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Work',
        color: '#4CAF50',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
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
    // Return mock events for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly sync with the team',
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
        calendar_id: '2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Lunch with Friend',
        description: 'Catch up at the new restaurant',
        start_date: new Date(today.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
        end_date: new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours later
        calendar_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Project Deadline',
        description: 'Submit final deliverables',
        start_date: tomorrow.toISOString(),
        end_date: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        calendar_id: '2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
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