// src/components/Admin/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, Users, UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [absentToday, setAbsentToday] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    className: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [view, setView] = useState('attendance');

  const classes = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  useEffect(() => {
    if (view === 'attendance') {
      fetchAttendance();
    } else {
      fetchAbsentToday();
    }
  }, [filters, view]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAttendance(filters);
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsentToday = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAbsentToday();
      if (response.data.success) {
        setAbsentToday(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching absent students:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      const response = await adminAPI.exportAttendance(filters);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `attendance_${filters.date || 'all'}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Attendance exported successfully!');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Export failed: ${errorMessage}`);
    }
  };

  // Calculate statistics
  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const total = attendance.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { present, absent, total, percentage };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Attendance Management</h1>
            <p className="text-[#FFD93D]">Track and manage student attendance</p>
          </div>
    
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-3">
            <button
              onClick={() => setView('attendance')}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                view === 'attendance'
                  ? 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] font-semibold'
                  : 'bg-[#F6F1E9] text-[#4F200D] hover:bg-gradient-to-r hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Daily Attendance
            </button>
            <button
              onClick={() => setView('absent')}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                view === 'absent'
                  ? 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] font-semibold'
                  : 'bg-[#F6F1E9] text-[#4F200D] hover:bg-gradient-to-r hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20'
              }`}
            >
              <UserX className="h-4 w-4 mr-2" />
              Absent Today
            </button>
          </div>

          {/* Stats */}
          {view === 'attendance' && (
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#4F200D]">{stats.percentage}%</div>
                <div className="text-xs text-[#4F200D]/70">Attendance Rate</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-[#4F200D]">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-sm font-medium">{stats.present}</span>
                </div>
                <div className="flex items-center space-x-1 text-[#FF9A00]">
                  <XCircle className="h-3 w-3" />
                  <span className="text-sm font-medium">{stats.absent}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#4F200D] mb-2">
              Class
            </label>
            <select
              value={filters.className}
              onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          {view === 'attendance' && (
            <div>
              <label className="block text-sm font-semibold text-[#4F200D] mb-2">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
              />
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ className: '', date: new Date().toISOString().split('T')[0] })}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/80 text-[#4F200D] rounded-lg hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20 transition-all duration-300 font-medium border border-[#FF9A00]/30"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9A00]"></div>
        </div>
      ) : view === 'attendance' ? (
        /* Daily Attendance View */
        <div className="space-y-4">
          {attendance.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-8 text-center shadow-sm">
              <Calendar className="h-12 w-12 text-[#4F200D]/40 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#4F200D] mb-2">No Attendance Records</h3>
              <p className="text-[#4F200D]/60">No attendance records found for the selected date and class.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendance.map((record) => (
                <div key={record._id} className="bg-white rounded-xl border border-[#FF9A00]/20 p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        record.status === 'present' 
                          ? 'bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D]' 
                          : 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D]'
                      }`}>
                        {record.status === 'present' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4F200D]">{record.student?.Std_Name}</h3>
                        <p className="text-xs text-[#4F200D]/70">{record.student?.Std_ID}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present' 
                        ? 'bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] border border-[#FF9A00]/30' 
                        : 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] border border-[#4F200D]/20'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#4F200D]/70">
                    <span>{record.class}</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Absent Today View */
        <div className="space-y-4">
          {absentToday.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-8 text-center shadow-sm">
              <UserCheck className="h-12 w-12 text-[#4F200D]/40 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#4F200D] mb-2">All Students Present!</h3>
              <p className="text-[#4F200D]/60">Great news! All students are present today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {absentToday.map((student) => (
                <div key={student._id} className="bg-white rounded-xl border border-[#FF9A00]/30 p-4 hover:border-[#FF9A00]/50 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] rounded-lg">
                        <UserX className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4F200D]">{student.Std_Name}</h3>
                        <p className="text-xs text-[#4F200D]/70">{student.Std_ID}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] rounded-full text-xs font-medium border border-[#4F200D]/20">
                      Absent
                    </span>
                  </div>
                  <div className="text-xs text-[#4F200D]/70">
                    {student.Class} • {student.parent_phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;