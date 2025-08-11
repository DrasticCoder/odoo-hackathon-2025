'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const initAuth = async () => {
      await initialize();
    };

    initAuth();
  }, [initialize]);

  return <>{children}</>;
}
