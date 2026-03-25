import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        try {
          // Verify user by calling /users/me
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (error) {
          console.error("Session verification failed", error);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    return await authService.register(name, email, password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const getMe = async () => {
    const freshUser = await authService.getMe();
    setUser(freshUser);
    return freshUser;
  };

  const updateMe = async (name) => {
    const updatedUser = await authService.updateMe(name);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    getMe,
    updateMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
