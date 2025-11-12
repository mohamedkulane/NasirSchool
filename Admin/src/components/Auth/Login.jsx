// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { School } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password, 'admin');
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4F200D] via-[#FF9A00] to-[#FFD93D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-[#FF9A00] to-[#FFD93D] rounded-full flex items-center justify-center shadow-lg">
            <School className="h-10 w-10 text-[#4F200D]" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-white">
            Naasir School
          </h2>
          <p className="mt-2 text-lg text-[#FFD93D] font-medium">
            Admin Dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 border border-[#4F200D]/20 text-[#4F200D] px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="text-center mb-6 flex justify-center">
            
            <img className='w-36 h-36 rounded-full' src="/nasir logo.jpeg" alt="" />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-[#4F200D] mb-3">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9] text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300"
              placeholder="Enter admin username"
              defaultValue="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#4F200D] mb-3">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9] text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300"
              placeholder="Enter admin password"
              defaultValue="admin123"
            />
          </div>

       

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-[#4F200D] bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] hover:from-[#FFD93D] hover:to-[#FF9A00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9A00] disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4F200D] mr-3"></div>
                Signing in...
              </div>
            ) : (
              'Sign in as Administrator'
            )}
          </button>

          <div className="text-center pt-4 border-t border-[#FF9A00]/20">
            <p className="text-xs text-[#4F200D]/70">
              Secure Admin Access • School Management System
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/80 text-sm">
            &copy; 2025 TechroSolutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;