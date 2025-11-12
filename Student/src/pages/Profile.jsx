import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentAPI } from '../services/api'
import Card, { CardContent, CardHeader } from '../components/UI/Card'
import Button from '../components/UI/Button'
import { User, Shield, Save, Edit, Check, X, Lock, Key, AlertCircle } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setLoading(false)
      return
    }

    try {
      const response = await studentAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2A5C6B] to-[#3E7A6B] bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-[#3E7A6B] mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] text-white shadow-lg'
                  : 'text-[#3E7A6B] hover:bg-[#ECF4E8] hover:text-[#2A5C6B]'
              }`}
            >
              <User size={18} className="mr-2" />
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] text-white shadow-lg'
                  : 'text-[#3E7A6B] hover:bg-[#ECF4E8] hover:text-[#2A5C6B]'
              }`}
            >
              <Shield size={18} className="mr-2" />
              Security
            </button>
          </nav>
        </CardContent>
      </Card>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2A5C6B]">Personal Information</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Student Name
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.Std_Name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Student ID
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.Std_ID}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Class
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.Class}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Shift
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium capitalize">{user?.Shift}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Gender
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.Gender}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Status
                    </label>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                        user?.Status === 'active' 
                          ? 'bg-green-100 text-green-700 border-green-200 shadow-sm'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {user?.Status === 'active' ? (
                          <Check size={14} className="mr-1.5" />
                        ) : (
                          <X size={14} className="mr-1.5" />
                        )}
                        {user?.Status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2A5C6B]">Parent Information</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Parent Name
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.parent_Name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                      Parent Phone
                    </label>
                    <div className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] px-4 py-3 rounded-xl border border-[#ABE7B2]">
                      <p className="text-[#2A5C6B] font-medium">{user?.parent_phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary Sidebar */}
          <div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] sticky top-6">
              <CardHeader className="border-b border-[#ABE7B2]">
                <h2 className="text-xl font-bold text-[#2A5C6B]">Account Summary</h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#ABE7B2]">
                    <div>
                      <span className="text-sm font-medium text-[#3E7A6B]">Member Since</span>
                      <p className="text-lg font-bold text-[#2A5C6B] mt-1">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#ABE7B2]">
                    <div>
                      <span className="text-sm font-medium text-[#3E7A6B]">Last Login</span>
                      <p className="text-lg font-bold text-[#2A5C6B] mt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[#ABE7B2]">
                    <div>
                      <span className="text-sm font-medium text-[#3E7A6B]">Account Status</span>
                      <p className={`text-lg font-bold mt-1 ${
                        user?.Status === 'active' ? 'text-green-600' : 'text-[#2A5C6B]'
                      }`}>
                        {user?.Status}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-2xl">
          {/* Change Password Card */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#2A5C6B]">Change Password</h2>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-700 shadow-sm'
                      : 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                  }`}>
                    <div className="flex items-center">
                      {message.type === 'success' ? (
                        <Check className="h-5 w-5 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2" />
                      )}
                      {message.text}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#93BFC7]" />
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="w-full pl-10 pr-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
                      required
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#93BFC7]" />
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="w-full pl-10 pr-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
                      required
                      minLength={6}
                      placeholder="Enter new password"
                    />
                  </div>
                  <p className="text-xs text-[#3E7A6B] mt-2 ml-10">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#93BFC7]" />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="w-full pl-10 pr-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save size={18} className="mr-2" />
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Tips Card */}
          <Card className="mt-6 border-0 shadow-xl bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
            <CardHeader className="border-b border-[#ABE7B2]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#2A5C6B]">Security Tips</h2>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4 text-[#3E7A6B]">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#93BFC7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span>Use a strong, unique password that you don't use elsewhere</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#93BFC7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span>Never share your password with anyone</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#93BFC7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span>Log out when using shared computers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#93BFC7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <span>Contact administration immediately if you suspect unauthorized access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Profile