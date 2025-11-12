import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, studentAPI } from '../services/api'

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

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('student_token')
      
      if (token) {
        const response = await studentAPI.getProfile()
        if (response.success) {
          setUser(response.data)
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (studentId, password) => {
    try {
      const response = await authAPI.studentLogin(studentId, password)
      if (response.success) {
        setUser(response.data.student)
        setIsAuthenticated(true)
        localStorage.setItem('student_token', response.data.token)
        localStorage.setItem('student_id', response.data.student._id)
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
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}