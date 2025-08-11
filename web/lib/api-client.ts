import { envConfig } from '@/config';
import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import { parseMessage } from '@/utils';

type ApiResult<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: {
        message: string;
        status: number;
        details?: Record<string, unknown>;
      };
    };

export class ApiClient {
  static async request<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
    try {
      // Get token from localStorage (client-side) or from auth store
      const getToken = () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('auth_token');
        }
        return null;
      };

      const token = getToken();
      const isFormData = config.data instanceof FormData;

      const client = axios.create({
        baseURL: envConfig.apiUrl,
        headers: {
          ...(config.data && !isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const response: AxiosResponse<T> = await client.request(config);
      return { data: response.data };
    } catch (err) {
      if (isAxiosError(err)) {
        // Handle 401 errors by clearing token, but only redirect if not on auth pages
        if (err.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');

          // Only redirect if not already on an auth page
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.startsWith('/auth') || currentPath === '/unauthorized';

          if (!isAuthPage) {
            window.location.href = '/auth/login';
          }
        }

        return {
          error: {
            message: parseMessage(err.response?.data.message),
            details: err.response?.data.data,
            status: err.response?.status || 500,
          },
        };
      }
      console.log(err);
      return {
        error: {
          message: 'An unknown error occurred',
          status: 500,
        },
      };
    }
  }

  static async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  static async post<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  static async put<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  static async patch<T, D = unknown>(url: string, data?: D): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  static async delete<T>(url: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    return this.request<T>({ method: 'DELETE', url, params });
  }
}
