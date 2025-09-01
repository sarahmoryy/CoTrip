import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserState } from './userSlice';

export class UserService {
  // Static method to set authentication token
  private static async setAuthToken(token: string) {
    await AsyncStorage.setItem('authToken', token);
  }

  // Make getAuthToken public to allow access from other services
  public static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  static async login(email: string, password: string): Promise<void> {
    const response = await fetch('https://your-api-endpoint/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Invalid credentials');
    const data = await response.json();
    const token = data.token;
    if (token) {
      await UserService.setAuthToken(token);
    } else {
      throw new Error('No token received');
    }
  }

  static async me(): Promise<UserState> {
    const token = await UserService.getAuthToken();
    if (!token) throw new Error('No authentication token');
    const response = await fetch('https://your-api-endpoint/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user data');
    const data = await response.json();
    return {
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
    };
  }

  static async updateMyUserData(userData: Partial<UserState>): Promise<void> {
    const token = await UserService.getAuthToken();
    if (!token) throw new Error('No authentication token');
    const response = await fetch('https://your-api-endpoint/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user data');
  }

  static async signup(fullName: string, email: string, password: string, confirmPassword: string): Promise<void> {
    if (password !== confirmPassword) throw new Error('Passwords do not match');
    if (!password || !confirmPassword) throw new Error('Password fields are required');
    const response = await fetch('https://your-api-endpoint/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    if (!response.ok) throw new Error('Sign-up failed');
  }

  static async logout(): Promise<void> {
    const token = await UserService.getAuthToken();
    if (token) {
      const response = await fetch('https://your-api-endpoint/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to logout');
      await AsyncStorage.removeItem('authToken');
    }
  }
}

export default UserService;