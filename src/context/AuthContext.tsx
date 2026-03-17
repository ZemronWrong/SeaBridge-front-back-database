import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'owner' | 'manager' | 'finance' | 'foreman' | 'worker';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  teamId?: string;
}

interface AuthContextValue {
  user: User | null;
  loginAs: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginAs = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
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

