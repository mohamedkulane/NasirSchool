import React from 'react';
import { Menu, User } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 ml-0 lg:ml-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-700">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;