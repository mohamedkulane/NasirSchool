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
    // ADD DEBUGGING
    console.log('🔍 AuthProvider checking localStorage...');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    // Check for token in all possible keys
    const token = localStorage.getItem('teacher_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('auth_token');
    
    const userData = localStorage.getItem('teacher_user') || 
                     localStorage.getItem('user');
    
    console.log('🔍 AuthProvider - Found:', { 
      token: token ? 'YES' : 'NO',
      userData: userData ? 'YES' : 'NO',
      teacher_token: localStorage.getItem('teacher_token'),
      token_key: localStorage.getItem('token'),
      teacher_user: localStorage.getItem('teacher_user')
    });
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ AuthProvider - User restored:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ AuthProvider - Error parsing user data:', error);
        // Clear everything
        localStorage.clear();
      }
    } else {
      console.log('⚠️ AuthProvider - No auth data found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('✅ AuthProvider - Login called:', { 
      userData, 
      token: token ? 'Token present' : 'No token'
    });
    
    // Save to localStorage with both keys for compatibility
    localStorage.setItem('teacher_token', token);
    localStorage.setItem('token', token); // Also store as token for compatibility
    localStorage.setItem('teacher_user', JSON.stringify(userData));
    
    setUser(userData);
    
    console.log('✅ AuthProvider - Login completed');
    console.log('🔍 After login, localStorage:', {
      teacher_token: localStorage.getItem('teacher_token'),
      token: localStorage.getItem('token'),
      teacher_user: localStorage.getItem('teacher_user')
    });
  };

  const logout = () => {
    console.log('🔄 AuthProvider - Logout called');
    
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('teacher_user');
    localStorage.removeItem('user');
    
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