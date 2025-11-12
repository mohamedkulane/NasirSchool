import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ClipboardList,
  User,
  School,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    expenses: 0,
    attendance: { present: 0, absent: 0 }
  });
  const [genderData, setGenderData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.data.totals);
        setGenderData(response.data.data.genderDistribution);
        setStats(prev => ({
          ...prev,
          attendance: response.data.data.attendance
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students.toLocaleString(),
      icon: Users,
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]',
      change: '+12%'
    },
    {
      title: 'Total Teachers',
      value: stats.teachers.toLocaleString(),
      icon: UserCheck,
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90',
      change: '+5%'
    },
    {
      title: 'Total Expenses',
      value: `$${stats.expenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]',
      change: '-3%'
    },
    {
      title: 'Attendance Today',
      value: `${stats.attendance.present}/${stats.attendance.present + stats.attendance.absent}`,
      icon: BookOpen,
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90',
      change: '+8%'
    }
  ];

  const quickActions = [
    { 
      label: 'Add Student', 
      icon: Users, 
      path: '/admin/students',
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]'
    },
    { 
      label: 'Add Teacher', 
      icon: UserCheck, 
      path: '/admin/teachers',
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90'
    },
    { 
      label: 'Add Expense', 
      icon: DollarSign, 
      path: '/admin/expenses',
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]'
    },
    { 
      label: 'Mark Attendance', 
      icon: Calendar, 
      path: '/admin/attendance',
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90'
    }
  ];

  const handleQuickAction = (path) => {
    navigate(path);
  };

  // Pie chart calculation with only 2 colors
  const getPieChartData = () => {
    if (!genderData.length) return [];
    
    const total = genderData.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    return genderData.map((gender, index) => {
      const percentage = (gender.count / total) * 100;
      const angle = (gender.count / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      // Use only 2 colors: #4F200D for male, #FF9A00 for female
      const color = gender._id === 'male' ? '#4F200D' : '#FF9A00';
      
      return {
        ...gender,
        percentage,
        angle,
        startAngle,
        color: color,
        lightColor: color + '20' // Add transparency for light version
      };
    });
  };

  const pieData = getPieChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9A00] mx-auto mb-4"></div>
          <p className="text-[#4F200D]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#FF9A00]/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#4F200D] mb-2">Admin Dashboard</h1>
            <p className="text-[#4F200D]/80">
              Comprehensive overview of school management system
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 p-3 rounded-lg border border-[#FF9A00]/30">
              <School className="h-8 w-8 text-[#4F200D]" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-[#FF9A00]/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#4F200D]/80 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-[#4F200D]">
                    {card.value}
                  </p>
                  <div className={`flex items-center mt-2 text-xs font-medium ${
                    card.change.startsWith('+') ? 'text-[#4F200D]' : 'text-[#FF9A00]'
                  }`}>
                    {card.change.startsWith('+') ? 
                      <TrendingUp className="h-3 w-3 mr-1" /> : 
                      <TrendingDown className="h-3 w-3 mr-1" />
                    }
                    {card.change} from last month
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.color} shadow-md`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution - Pie Chart with 2 Colors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#FF9A00]/20 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#4F200D] flex items-center">
              <User className="h-5 w-5 mr-2 text-[#4F200D]" />
              Gender Distribution
            </h3>
            <Activity className="h-4 w-4 text-[#4F200D]/60" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Pie Chart */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {pieData.map((slice, index) => (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="20"
                    strokeDasharray={`${slice.angle} ${360 - slice.angle}`}
                    strokeDashoffset={-slice.startAngle}
                    className="transition-all duration-500 ease-out"
                  />
                ))}
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#4F200D]">
                    {stats.students.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#4F200D]/70">Total</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-4">
              {pieData.map((gender, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:shadow-md"
                  style={{ 
                    backgroundColor: gender.color + '10',
                    borderColor: gender.color + '30'
                  }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: gender.color }}
                    />
                    <span className="font-medium text-[#4F200D] capitalize">
                      {gender._id} 
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#4F200D]">
                      {gender.count}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: gender.color }}>
                      {gender.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Summary */}
              <div className="mt-4 p-3 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 rounded-lg border border-[#FF9A00]/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#4F200D]">Total Students</span>
                  <span className="font-bold text-[#4F200D]">{stats.students.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#FF9A00]/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#4F200D]">Quick Actions</h3>
            <Plus className="h-4 w-4 text-[#4F200D]/60" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.path)}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/50 rounded-lg hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20 transition-all duration-300 border border-[#FF9A00]/20 hover:border-[#FF9A00]/40 hover:shadow-md"
                >
                  <div className={`p-2 rounded-lg ${action.color} mb-2 shadow-md`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#4F200D] text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;