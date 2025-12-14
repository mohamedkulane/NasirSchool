import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/UI/Button'
import { BookOpen } from 'lucide-react'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.studentId, formData.password)
    
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.')
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF4E8] via-[#CBF3BB] to-[#93BFC7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ABE7B2] opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#93BFC7] opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-br from-[#3E7A6B] to-[#2A5C6B] opacity-10 rounded-full blur-xl"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-full blur-md opacity-70"></div>
              <img 
                className='w-36 h-36 relative z-10 rounded-full border-4 border-white shadow-lg' 
                src="/nasir logo.jpeg" 
                alt="Naasir School Logo" 
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2A5C6B] to-[#3E7A6B] bg-clip-text text-transparent mb-2">
              Naasir School
            </h1>
            <p className="text-[#3E7A6B] font-medium">
              Enter your Student ID and password to access!
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-semibold text-[#2A5C6B] mb-2">
                  Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#3E7A6B] transition-all duration-300 placeholder:text-[#93BFC7]"
                  placeholder="Enter your Student ID"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#2A5C6B] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#3E7A6B] transition-all duration-300 placeholder:text-[#93BFC7]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border-0"
            >
              Sign In
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-[#ECF4E8] text-center">
            <p className="text-sm text-[#3E7A6B] font-medium">
              Having trouble logging in? Contact school administration.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-[#93BFC7]">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Secure Student Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login