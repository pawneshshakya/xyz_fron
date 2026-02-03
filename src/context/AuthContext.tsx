import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';

interface AuthContextData {
  authData: any;
  loading: boolean;
  signIn: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (token: string) => Promise<void>;
  updateAuthData: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const authDataSerialized = await SecureStore.getItemAsync('authData');
      if (authDataSerialized) {
        const _authData = JSON.parse(authDataSerialized);
        setAuthData(_authData);
        if (_authData.token) setAuthToken(_authData.token);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (data: any) => {
    setAuthToken(data.token);
    setAuthData(data);
    await SecureStore.setItemAsync('authData', JSON.stringify(data));
  };

  const signUp = async (token: string) => {
      // Logic same as sign in often, or fetch profile
      // For now assume we get full data or just token
      // This might need refinement based on API response
      // But for MVP let's assume register returns token and we settle for that or redirect to login
  };

  const signOut = async () => {
    setAuthToken(null);
    setAuthData(null);
    await SecureStore.deleteItemAsync('authData');
  };

  const updateAuthData = async (updates: any) => {
    const updatedData = { ...authData, ...updates };
    setAuthData(updatedData);
    await SecureStore.setItemAsync('authData', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{ authData, loading, signIn, signOut, signUp, updateAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
