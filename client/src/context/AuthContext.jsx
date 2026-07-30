import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { account } = await api.get('/auth/me');
    setAccount(account);
    return account;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = async (loginEmail, password) => {
    await api.post('/auth/login', { loginEmail, password });
    return refresh();
  };

  const signup = async (fields) => {
    await api.post('/auth/signup', fields);
    return refresh();
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ account, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
