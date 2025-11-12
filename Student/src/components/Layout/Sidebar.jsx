import React, { useEffect, useRef } from 'react'
import { X, Home, BookOpen, Calendar, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const sidebarRef = useRef(null)

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/exam-results', icon: BookOpen, label: 'Exam Results' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile overlay with fade animation */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside 
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-[#ECF4E8] to-[#CBF3BB] shadow-xl transform transition-all duration-500 ease-out
          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} 
          md:translate-x-0 md:opacity-100 md:static md:z-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with subtle animation */}
          <div className="flex items-center justify-between p-4 border-b border-[#ABE7B2] bg-[#ECF4E8]">
            <div className="transform transition-transform duration-300 hover:scale-105">
              <h2 className="text-lg font-semibold text-[#2A5C6B]">Student Portal</h2>
              <p className="text-sm text-[#3E7A6B]">{user?.Class}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#93BFC7] hover:bg-[#CBF3BB] transition-all duration-300 transform hover:rotate-90 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation with enhanced animations */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {menuItems.map((item, index) => (
                <li 
                  key={item.path}
                  className="transform transition-all duration-500"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isOpen ? `slideInLeft 0.5s ease-out ${index * 0.1}s both` : 'none'
                  }}
                >
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      transform hover:translate-x-2 hover:shadow-md group
                      ${isActive 
                        ? 'bg-[#93BFC7] text-white shadow-md' 
                        : 'text-[#2A5C6B] hover:bg-[#ABE7B2] hover:text-[#1E4646]'
                      }
                    `}
                  >
                    <item.icon 
                      size={18} 
                      className="transition-transform duration-300 group-hover:scale-110" 
                    />
                    <span className="transition-all duration-300">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer with subtle animation */}
          <div className="p-4 border-t border-[#ABE7B2] bg-[#ECF4E8] transform transition-transform duration-500 hover:translate-y-1">
            <div className="text-center">
              <p className="text-xs text-[#3E7A6B] transition-colors duration-300 hover:text-[#2A5C6B]">
                Student ID: {user?.Std_ID}
              </p>
              <p className="text-xs text-[#93BFC7] mt-1 transition-all duration-300 hover:tracking-wider">
                School Management System
              </p>
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default Sidebar