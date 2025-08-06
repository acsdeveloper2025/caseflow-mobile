import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import AsyncStorage from '../polyfills/AsyncStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<Pick<User, 'profilePhotoUrl' | 'idCardUrl'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const storedUser = await AsyncStorage.getItem('user');
          if(storedUser) {
            setUser(JSON.parse(storedUser));
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to check auth status", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (username: string) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    
    const storedUser = await AsyncStorage.getItem('user');
    let mockUser: User;

    if (storedUser && JSON.parse(storedUser).username === username) {
        mockUser = JSON.parse(storedUser);
    } else {
        mockUser = { id: 'user-1', name: 'Field Agent', username };
    }
    
    await AsyncStorage.setItem('auth_token', 'mock_jwt_token');
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = async (updates: Partial<Pick<User, 'profilePhotoUrl' | 'idCardUrl'>>) => {
    if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
