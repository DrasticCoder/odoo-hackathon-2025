import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/auth.type';
import { AuthService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        AuthService.storeToken(token);
        set({ token, isAuthenticated: true });
      },

      login: (user: User, token: string) => {
        AuthService.storeToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        AuthService.removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Clear auth state due to token expiry or error
      clearAuth: () => {
        AuthService.removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: () => {
        const token = AuthService.getToken();
        if (token) {
          set({ token, isAuthenticated: true });
        } else {
          set({ token: null, isAuthenticated: false, user: null });
        }
      },

      // Initialize auth state from persisted data
      initialize: async () => {
        const token = AuthService.getToken();
        const state = get();

        if (token) {
          // If we have a token, verify it with the server
          try {
            const response = await AuthService.getMe();
            if (response.data) {
              set({
                token,
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Token is invalid, clear auth state
              get().clearAuth();
            }
          } catch (error) {
            // Token is invalid or expired, clear auth state
            get().clearAuth();
          }
        } else if (!token) {
          set({ token: null, isAuthenticated: false, user: null, isLoading: false });
        }
      },

      // Refresh user data from server
      refreshUser: async () => {
        const token = AuthService.getToken();
        if (!token) return;

        try {
          const response = await AuthService.getMe();
          if (response.data) {
            set({ user: response.data.user });
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions to check user roles
export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role || null;
};

export const useIsAdmin = () => {
  const role = useUserRole();
  return role === UserRole.ADMIN;
};

export const useIsOwner = () => {
  const role = useUserRole();
  return role === UserRole.OWNER;
};

export const useIsUser = () => {
  const role = useUserRole();
  return role === UserRole.USER;
};
