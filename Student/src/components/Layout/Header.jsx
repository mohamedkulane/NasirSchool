import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, User, LogOut, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] shadow-lg border-b border-[#ABE7B2]/50 backdrop-blur-sm relative z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 group md:hidden border border-[#ABE7B2]/30"
          >
            <Menu size={18} className="text-[#3E7A6B] group-hover:text-[#93BFC7] transition-colors" />
          </button>
          
          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex items-center bg-white/80 rounded-2xl px-4 py-2 shadow-md border border-[#ABE7B2]/30">
            <Search size={18} className="text-[#3E7A6B] mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-[#2A5C6B] placeholder-[#93BFC7] w-40 lg:w-56"
            />
          </div>
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center md:text-left md:pl-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#93BFC7] to-[#3E7A6B] bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#3E7A6B] mt-1 hidden md:block">
            Welcome back, {user?.Std_Name?.split(' ')[0]}!
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications */}
          <button className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 group border border-[#ABE7B2]/30">
            <Bell size={18} className="text-[#3E7A6B] group-hover:text-[#93BFC7] transition-colors" />
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] rounded-full border-2 border-white shadow-sm"></span>
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#93BFC7] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 group border border-[#ABE7B2]/30"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:shadow-md transition-shadow">
                <User size={16} className="text-white" />
              </div>
              
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-[#2A5C6B] group-hover:text-[#93BFC7] transition-colors">
                  {user?.Std_Name}
                </p>
                <p className="text-xs text-[#3E7A6B]">{user?.Class}</p>
              </div>
              
              <ChevronDown 
                size={14} 
                className={`text-[#3E7A6B] transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu - Fixed positioning to stay on top */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-[#ABE7B2]/30 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                {/* User Info */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-[#ABE7B2]/30">
                  <p className="font-semibold text-[#2A5C6B] text-sm sm:text-base truncate">{user?.Std_Name}</p>
                  <p className="text-xs text-[#3E7A6B] mt-1">Student ID: {user?.Std_ID}</p>
                  <p className="text-xs text-[#93BFC7] font-medium mt-1 sm:mt-2">{user?.Class}</p>
                </div>
                
                {/* Dropdown Items */}
                <div className="py-1 sm:py-2">
                  <button 
                    onClick={() => {
                      navigate('/profile')
                      setShowDropdown(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-[#2A5C6B] hover:bg-[#ECF4E8] transition-colors flex items-center space-x-2 sm:space-x-3 group"
                  >
                    <User size={14} className="text-[#3E7A6B] group-hover:text-[#93BFC7] transition-colors flex-shrink-0" />
                    <span className="truncate">View Profile</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/settings')
                      setShowDropdown(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-[#2A5C6B] hover:bg-[#ECF4E8] transition-colors flex items-center space-x-2 sm:space-x-3 group"
                  >
                    <Bell size={14} className="text-[#3E7A6B] group-hover:text-[#93BFC7] transition-colors flex-shrink-0" />
                    <span className="truncate">Notification Settings</span>
                  </button>
                </div>
                
                {/* Logout Button */}
                <div className="border-t border-[#ABE7B2]/30 pt-1 sm:pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-[#93BFC7] hover:bg-[#ECF4E8] transition-colors flex items-center space-x-2 sm:space-x-3 group font-semibold"
                  >
                    <LogOut size={14} className="group-hover:transform group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

   
    </header>
  )
}

export default Header