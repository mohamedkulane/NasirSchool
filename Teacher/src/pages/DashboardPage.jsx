import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import { 
  Users, 
  User, 
  UserCheck, 
  School, 
  BookOpen, 
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      console.log('Fetching dashboard for teacher:', user.id);
      
      const response = await teacherAPI.getDashboard(user.id);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        console.log('Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-lg font-semibold mb-4">Failed to load dashboard data</div>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { teacherInfo, students, subjects, attendance } = dashboardData;

  // Calculate attendance percentage
  const calculatePercentage = (present, total) => {
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  };

  // Get progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {teacherInfo.name}! 👋</h1>
            <p className="text-gray-600">Here's your teaching overview for today</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="mt-4 lg:mt-0 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{students.total}</p>
              <div className="flex items-center space-x-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">All enrolled</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Male Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Male Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{students.male}</p>
              <div className="flex items-center space-x-2 mt-2">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 font-medium">
                  {students.total > 0 ? ((students.male / students.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Female Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Female Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{students.female}</p>
              <div className="flex items-center space-x-2 mt-2">
                <UserCheck className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-pink-600 font-medium">
                  {students.total > 0 ? ((students.female / students.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <UserCheck className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Classes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{teacherInfo.classes.length}</p>
              <div className="flex items-center space-x-2 mt-2">
                <School className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <School className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Classes and Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <School className="w-5 h-5 text-blue-600" />
              <span>Your Classes</span>
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
              {teacherInfo.classes.length} Active
            </span>
          </div>
          <div className="space-y-3">
            {teacherInfo.classes.map((className, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="font-semibold text-gray-800">{className}</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Progress Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Subjects Progress</span>
            </h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded">
              {subjects.length} Subjects
            </span>
          </div>
          <div className="space-y-4">
            {subjects.map((subject, index) => {
              const progressPercentage = subject.hasExams ? 
                (subject.examsCompleted / Math.max(subject.examsCompleted, 1)) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{subject.subject}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      subject.hasExams 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {subject.hasExams ? `${subject.examsCompleted} exams` : 'No exams'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(progressPercentage)} transition-all duration-1000 ease-out`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {attendance && attendance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Today's Attendance Overview</span>
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
              Live Data
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((item, index) => {
                  const percentage = calculatePercentage(item.presentCount, item.totalCount);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          <span className="font-semibold text-gray-800">{item._id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-green-600">{item.presentCount}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{item.totalCount}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold text-sm ${
                            percentage >= 80 ? 'text-green-600' : 
                            percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;