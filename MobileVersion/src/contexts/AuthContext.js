import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const userData = await authService.getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Helper functions untuk role checking
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  const hasAnyRole = (roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some(role => user.roles.includes(role));
  };

  const isAdmin = () => {
    return hasAnyRole(['Super Admin', 'Admin', 'Sekretaris', 'Bendahara']);
  };

  const isPresiden = () => {
    return hasAnyRole(['Presiden BEM', 'Presiden', 'Wakil Presiden BEM']);
  };

  const isMenteri = () => {
    return hasRole('Menteri');
  };

  const isAnggota = () => {
    return hasRole('Anggota');
  };

  const getPrimaryRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return null;
    
    // Priority sesuai dengan DatabaseSeeder
    const priority = [
      'Super Admin',
      'Admin',
      'Presiden BEM',
      'Presiden',
      'Wakil Presiden BEM',
      'Sekretaris',
      'Bendahara',
      'Menteri',
      'Anggota'
    ];
    
    for (const role of priority) {
      if (user.roles.includes(role)) {
        return role;
      }
    }
    return user.roles[0]; // Return first role if not in priority list
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole,
    isAdmin,
    isPresiden,
    isMenteri,
    isAnggota,
    getPrimaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

