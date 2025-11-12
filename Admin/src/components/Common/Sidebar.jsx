import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  DollarSign, 
  BookOpen, 
  ClipboardList, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  School
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/teachers', icon: UserCheck, label: 'Teachers' },
    { path: '/admin/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/admin/exam-results', icon: BookOpen, label: 'Exam Results' },
    { path: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#4F200D] text-[#F6F1E9] rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#4F200D]/90 hover:shadow-xl"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
        ) : (
          <Menu className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-full bg-gradient-to-b from-[#F6F1E9] to-[#F6F1E9]/95 border-r border-[#FF9A00]/20 text-gray-700
        transform transition-all duration-500 ease-in-out z-50 shadow-xl
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        relative
      `}>
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 p-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
        >
          {isCollapsed ? 
            <ChevronRight className="h-4 w-4 transition-transform duration-300" /> : 
            <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
          }
        </button>

        {/* Scrollable Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b border-[#FF9A00]/20 transition-all duration-500 flex-shrink-0 ${isCollapsed ? 'px-4' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="bg-gradient-to-br from-[#4F200D] to-[#FF9A00] p-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <School className="h-6 w-6 text-[#F6F1E9] transition-transform duration-300 hover:scale-110" />
              </div>
              {!isCollapsed && (
                <div className="transition-all duration-500 ease-out">
                  <h1 className="text-lg font-bold text-[#4F200D] transition-all duration-300 hover:translate-x-1">
                    Naasir School
                  </h1>
                  <p className="text-[#FF9A00] text-sm mt-1 capitalize transition-all duration-300 hover:translate-x-1">
                    {user?.role || 'Admin'} Panel
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    group flex items-center mb-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out
                    ${isActive
                      ? 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] shadow-lg transform scale-[1.02]'
                      : 'text-[#4F200D] hover:bg-[#FFD93D]/20 hover:text-[#4F200D] hover:shadow-md hover:transform hover:scale-[1.02]'
                    }
                    ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
                    ${hoveredItem === index && !isActive ? 'bg-[#FFD93D]/10 border border-[#FF9A00]/30' : ''}
                  `}
                  style={{
                    transitionDelay: isCollapsed ? '0ms' : `${index * 50}ms`
                  }}
                >
                  <div className={`transition-all duration-300 ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      isActive 
                        ? 'text-[#4F200D] scale-110' 
                        : 'text-[#4F200D]/70 group-hover:text-[#4F200D] group-hover:scale-110'
                    }`} />
                  </div>
                  {!isCollapsed && (
                    <span className="transition-all duration-300 transform group-hover:translate-x-1">
                      {item.label}
                    </span>
                  )}
                  
                  {/* Hover Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#4F200D] text-[#F6F1E9] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer with Logout */}
          <div className={`p-4 border-t border-[#FF9A00]/20 bg-gradient-to-t from-[#F6F1E9] to-[#F6F1E9]/80 transition-all duration-500 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                flex items-center text-[#4F200D] hover:text-[#4F200D] w-full rounded-xl transition-all duration-300 ease-out
                ${isCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
                ${hoveredItem === 'logout' ? 'bg-[#FF9A00]/10 transform scale-[1.02]' : ''}
              `}
              title="Logout"
            >
              <LogOut className={`h-4 w-4 transition-all duration-300 ${
                isCollapsed ? '' : 'mr-2'
              } ${hoveredItem === 'logout' ? 'transform -translate-x-0.5' : ''}`} />
              {!isCollapsed && (
                <span className="transition-all duration-300 transform hover:translate-x-0.5">
                  Logout
                </span>
              )}
              
              {/* Hover Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#4F200D] text-[#F6F1E9] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 pointer-events-none z-50 whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
            
            {/* User Info - Only show when not collapsed */}
            {!isCollapsed && user && (
              <div className="mt-3 pt-3 border-t border-[#FF9A00]/10 transition-all duration-500">
                <p className="text-xs text-[#4F200D]/70 truncate transition-all duration-300">
                  {user.name || user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;