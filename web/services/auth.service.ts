import { ApiClient } from '@/lib/api-client';
import {
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  OtpRequest,
  VerifyOtpRequest,
  User,
} from '@/types/auth.type';

export class AuthService {
  // Password-based authentication
  static async signUp(data: SignUpRequest) {
    return await ApiClient.post<SignUpResponse>('/api/auth/signup', data);
  }

  static async login(data: LoginRequest) {
    return await ApiClient.post<LoginResponse>('/api/auth/login', data);
  }

  // OAuth authentication
  static async handleGoogleAuth(idToken: string) {
    return await ApiClient.post<LoginResponse>('/api/auth/google', { idToken });
  }

  // OTP-based authentication
  static async sendOtp(data: OtpRequest) {
    return await ApiClient.post<boolean>('/api/auth/otp', data);
  }

  static async verifyOtp(data: VerifyOtpRequest) {
    return await ApiClient.post<LoginResponse>('/api/auth/otp/verify', data);
  }

  static async resendVerificationOtp(data: OtpRequest) {
    return await ApiClient.post<{ message: string }>('/api/auth/otp/resend', data);
  }

  // Utility methods
  static storeToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  static removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current user information
  static async getMe() {
    return await ApiClient.get<{ user: User }>('/api/auth/me');
  }
}
