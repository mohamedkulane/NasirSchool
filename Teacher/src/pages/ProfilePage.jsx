import React, { useState } from 'react';
import { useAuth } from '../utils/auth';
import { teacherAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Shield, 
  BookOpen, 
  Users,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [changePassword, setChangePassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setChangePassword({
      ...changePassword,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (changePassword.newPassword !== changePassword.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (changePassword.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await teacherAPI.changePassword({
        teacherId: user.id,
        currentPassword: changePassword.currentPassword,
        newPassword: changePassword.newPassword
      });

      toast.success('Password changed successfully');
      setChangePassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center space-x-3">
              <User className="w-7 h-7 text-blue-200" />
              <span>Teacher Profile</span>
            </h1>
            <p className="text-blue-200 opacity-90">Manage your personal and teaching information</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="hidden md:flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-xl">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{user?.classes?.length || 0} Classes</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-xl">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">{user?.subjects?.length || 0} Subjects</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h2>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Full Name</label>
              <p className="text-lg font-bold text-gray-800">{user?.name}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Username</label>
              <p className="text-lg font-bold text-gray-800">{user?.userName}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Role</label>
              <p className="text-lg font-bold text-gray-800 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Teaching Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Teaching Information</span>
            </h2>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-3">Classes</label>
              <div className="flex flex-wrap gap-2">
                {user?.classes?.map((className, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                  >
                    <Users className="w-3 h-3 mr-2" />
                    {className}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-3">Subjects</label>
              <div className="flex flex-wrap gap-2">
                {user?.subjects?.map((subject, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                  >
                    <BookOpen className="w-3 h-3 mr-2" />
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>Change Password</span>
          </h2>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Password */}
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={changePassword.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="relative">
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={changePassword.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={changePassword.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium pr-12"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${changePassword.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                At least 6 characters long
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${changePassword.newPassword === changePassword.confirmPassword && changePassword.newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                New passwords must match
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Changing Password...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage