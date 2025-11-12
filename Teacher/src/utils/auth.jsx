import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('teacher_token');
    const userData = localStorage.getItem('teacher_user');
    
    console.log('AuthProvider - Loading from storage:', { token, userData });
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('AuthProvider - User restored:', parsedUser);
      } catch (error) {
        console.error('AuthProvider - Error parsing user data:', error);
        localStorage.removeItem('teacher_token');
        localStorage.removeItem('teacher_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('AuthProvider - Login called:', { userData, token });
    
    localStorage.setItem('teacher_token', token);
    localStorage.setItem('teacher_user', JSON.stringify(userData));
    setUser(userData);
    
    console.log('AuthProvider - Login completed, user set:', userData);
  };

  const logout = () => {
    console.log('AuthProvider - Logout called');
    
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};