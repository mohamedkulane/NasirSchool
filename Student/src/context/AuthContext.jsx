import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, studentAPI } from '../services/api'
import { checkTokenValidity } from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // ✅ KU DAR: checkAuthStatus function
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('student_token')
      
      if (!token) {
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
        return false
      }

      // Check token validity with backend
      const isValid = await checkTokenValidity()
      
      if (!isValid) {
        // Token is invalid, clear everything
        logout()
        return false
      }

      // Token is valid, get user profile
      const response = await studentAPI.getProfile()
      if (response.success) {
        setUser(response.data)
        setIsAuthenticated(true)
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      logout()
      return false
    }
  }, [])

  // ✅ SAXI: useEffect to check auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuthStatus()
      setLoading(false)
    }
    initializeAuth()
  }, [checkAuthStatus])

  const login = async (studentId, password) => {
    try {
      const response = await authAPI.studentLogin(studentId, password)
      if (response.success) {
        setUser(response.data.student)
        setIsAuthenticated(true)
        localStorage.setItem('student_token', response.data.token)
        localStorage.setItem('student_id', response.data.student._id)
        localStorage.setItem('student_name', response.data.student.Std_Name)
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('student_token')
    localStorage.removeItem('student_id')
    localStorage.removeItem('student_name')
    localStorage.removeItem('loginAllowed')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus, // ✅ KU DAR: Export checkAuthStatus
    setUser,
    setIsAuthenticated,
    setLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}