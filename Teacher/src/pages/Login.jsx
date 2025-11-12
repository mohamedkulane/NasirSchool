import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { teacherAPI } from '../services/api';
import toast from 'react-hot-toast';
import { School, Eye, EyeOff, BookOpen } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    User_Name: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.User_Name || !credentials.password) {
      toast.error('Fadlan geli username iyo password');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', credentials);
      
      const response = await teacherAPI.login(credentials);
      console.log('Login response:', response.data);

      if (response.data.success) {
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Username ama password khalad ah');
        } else if (error.response.status === 404) {
          toast.error('Server endpoint not found. Check backend.');
        } else {
          toast.error(error.response.data?.error || 'Login failed');
        }
      } else if (error.request) {
        toast.error('No response from server. Check if backend is running.');
      } else {
        toast.error('Network error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2D4F2B] via-[#3A6438] to-[#457443] p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFB823] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFD166] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-[#708A58] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-500">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto  flex items-center justify-center  mb-4 transform hover:rotate-12 transition-transform duration-500">
              <img className='w-36 h-36 rounded-md' src="/nasir logo.jpeg" alt="" />
            </div>
            <h2 className="text-3xl font-bold text-[#2D4F2B] mb-2">
              Naasir School
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Development helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 text-center">
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username Field */}
              <div className="relative">
                <input
                  id="User_Name"
                  name="User_Name"
                  type="text"
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#FFB823]/50 focus:border-[#FFB823] transition-all duration-300 text-lg font-medium shadow-lg"
                  placeholder="Username"
                  value={credentials.User_Name}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-4 bg-white/80 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#FFB823]/50 focus:border-[#FFB823] transition-all duration-300 text-lg font-medium shadow-lg"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#2D4F2B] transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-[#2D4F2B] transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-[#FFB823] to-[#FFD166] text-[#2D4F2B] rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-2xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#2D4F2B] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign in
                  <div className="ml-2 transform group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              EduPortal Teacher Management System
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;