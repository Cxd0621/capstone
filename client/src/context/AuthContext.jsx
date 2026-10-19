// Global authentication state (Context API).
// The token lives in localStorage so a page refresh keeps the user logged in;
// on start-up we ask the API who the token belongs to.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'capstone.auth.token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setReady(true);
      return undefined;
    }

    let cancelled = false;
    setReady(false);

    api
      .me(token)
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        // The token is invalid or expired - forget it
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const applySession = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser({ _id: data._id, username: data.username, email: data.email });
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const register = useCallback(
    async (username, email, password) => {
      const data = await api.register({ username, email, password });
      applySession(data);
      return data;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    ready,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
