'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthContext = createContext({});
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('token');
      if (storedToken) {
        try {
          const res = await fetch(`${STRAPI_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (res.ok) {
            setUser(await res.json());
            setToken(storedToken);
          } else {
            Cookies.remove('token');
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Invalid username or password.');
      }

      Cookies.set('token', data.jwt, { expires: 7, path: '/' });
      setToken(data.jwt);
      setUser(data.user);
      
      router.push('/dashboard');
      router.refresh();
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Registration failed.');
      }

      Cookies.set('token', data.jwt, { expires: 7, path: '/' });
      setToken(data.jwt);
      setUser(data.user);

      router.push('/dashboard');
      router.refresh();
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    setUser(null);
    setToken(null);
    setError(null);
    router.push('/signin');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, STRAPI_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
