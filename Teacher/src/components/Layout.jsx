import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarCheck, 
  User,
  Menu,
  LogOut,
  School,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/exam-results', label: 'Exam Results', icon: Award },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col transform transition-all duration-300 ease-in-out ${
          isDesktopSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto bg-white border-r border-gray-200 relative">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            className="absolute -right-3 top-6 z-10 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors duration-300 border-2 border-white"
          >
            {isDesktopSidebarCollapsed ? 
              <ChevronRight className="w-4 h-4" /> : 
              <ChevronLeft className="w-4 h-4" />
            }
          </button>

          {/* Logo Section */}
          <div className={`flex items-center flex-shrink-0 px-6 mb-8 transition-all duration-300 ${
            isDesktopSidebarCollapsed ? 'justify-center' : ''
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                <School className="w-7 h-7 text-white" />
              </div>
              {!isDesktopSidebarCollapsed && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-xl font-bold text-gray-800">EduPortal</h1>
                  <p className="text-xs text-gray-600 font-medium">Teacher Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="mt-4 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${isDesktopSidebarCollapsed ? 'justify-center px-3' : ''}`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-blue-700' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    } ${isDesktopSidebarCollapsed ? 'mr-0' : 'mr-3'}`}>
                      <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                        isActive(item.path) ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                      }`} />
                    </div>
                    {!isDesktopSidebarCollapsed && (
                      <>
                        <span className="transition-all duration-300 font-medium">{item.label}</span>
                        {isActive(item.path) && (
                          <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
            <div className={`flex items-center justify-between transition-all duration-300 ${
              isDesktopSidebarCollapsed ? 'flex-col space-y-3' : ''
            }`}>
              <div className={`flex items-center ${isDesktopSidebarCollapsed ? 'flex-col space-y-2' : 'space-x-3'}`}>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm border-2 border-white">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
                {!isDesktopSidebarCollapsed && (
                  <div className="transition-opacity duration-300">
                    <p className="text-sm font-medium text-gray-800">{user?.name || 'Teacher'}</p>
                    <p className="text-xs text-gray-600 font-medium">Professional Educator</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white text-gray-800 p-4 shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              {isSidebarOpen ? 
                <X className="w-5 h-5" /> : 
                <Menu className="w-5 h-5" />
              }
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <School className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800">EduPortal</h1>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm border-2 border-white">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`absolute top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-6 h-full flex flex-col">
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <School className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">EduPortal</h1>
                    <p className="text-xs text-gray-600 font-medium">Teacher Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                        isActive(item.path) 
                          ? 'bg-blue-700' 
                          : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isActive(item.path) ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      {item.label}
                      {isActive(item.path) && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Section */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-lg mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm border-2 border-white">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user?.name || 'Teacher'}</p>
                      <p className="text-xs text-gray-600 font-medium">Professional Educator</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="bg-white rounded-lg border border-gray-200 min-h-full">
            <div className="p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;