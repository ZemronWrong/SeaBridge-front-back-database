import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch, setAuthToken, removeAuthToken, getAuthToken } from '../api';

export type UserRole = 'owner' | 'manager' | 'finance' | 'foreman' | 'worker';

export interface User {
  id: string | number;
  name: string;
  first_name: string;
  last_name: string;
  username: string;
  role: UserRole;
  employee_id?: string;
  team_id?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parse user to match the frontend shape slightly
  const mapUser = (apiUser: any): User => ({
    ...apiUser,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    employeeId: apiUser.employee_id,
    teamId: apiUser.team_id,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await apiFetch('/auth/profile/');
          setUser(mapUser(profile));
        } catch {
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setAuthToken(data.token);
      setUser(mapUser(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (getAuthToken()) {
         await apiFetch('/auth/logout/', { method: 'POST' });
      }
    } catch {
      // ignore network errors on logout
    } finally {
      removeAuthToken();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

