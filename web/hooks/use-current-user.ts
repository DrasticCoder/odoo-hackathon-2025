'use client';

import { useAuthStore } from '@/store';

/**
 * Hook to get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

/**
 * Hook to refresh current user data from server
 * @returns Function to refresh user data
 */
export function useRefreshUser() {
  return useAuthStore((state) => state.refreshUser);
}

/**
 * Hook to check if user has a specific role
 * @param role - The role to check for
 * @returns Boolean indicating if user has the role
 */
export function useHasRole(role: string) {
  const user = useCurrentUser();
  return user?.role === role;
}

/**
 * Hook to check if current user is verified
 * @returns Boolean indicating if user is verified
 */
export function useIsVerified() {
  const user = useCurrentUser();
  return user?.isVerified ?? false;
}

/**
 * Hook to check if current user is active
 * @returns Boolean indicating if user is active
 */
export function useIsActive() {
  const user = useCurrentUser();
  return user?.isActive ?? false;
}
