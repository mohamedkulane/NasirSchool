import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Save,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setClasses(user.classes || []);
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
      checkTodayAttendance();
    }
  }, [selectedClass]);

  const fetchStudentsByClass = async () => {
    try {
      const response = await teacherAPI.getStudentsByClass(selectedClass);
      if (response.data.success) {
        const studentsData = response.data.data;
        setStudents(studentsData);
        
        // Initialize attendance state
        const initialAttendance = {};
        studentsData.forEach(student => {
          initialAttendance[student._id] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await teacherAPI.getAttendance({
        class: selectedClass,
        date: today
      });

      if (response.data.success && response.data.data.length > 0) {
        setTodayAttendance(response.data.data);
        toast.success('Attendance already taken for today');
      } else {
        setTodayAttendance([]);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    if (todayAttendance.length > 0) {
      toast.error('Attendance already saved for today');
      return;
    }

    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (todayAttendance.length > 0) {
      toast.error('Attendance already saved for today');
      return;
    }

    setLoading(true);
    try {
      const attendanceData = Object.keys(attendance).map(studentId => ({
        studentId,
        status: attendance[studentId]
      }));

      await teacherAPI.createAttendance({
        class: selectedClass,
        attendanceData
      });

      toast.success('Attendance saved successfully');
      checkTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    return { present, absent, total: students.length };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center space-x-3">
              <Calendar className="w-7 h-7 text-blue-200" />
              <span>Attendance Registration</span>
            </h1>
            <p className="text-blue-200 opacity-90">Manage student attendance for your classes</p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-xl">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">{classes.length} Classes</span>
          </div>
        </div>
      </div>

      {/* Class Selection Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Select Class</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full md:w-80 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
            >
              <option value="">Choose Class</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          
          {selectedClass && (
            <div className="flex items-center space-x-4">
              <div className="text-center bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold border border-blue-200">
                Selected: {selectedClass}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedClass && (
        <>
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-blue-100 font-medium">Total Students</div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-blue-200" />
                <span>Student Attendance</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr 
                      key={student._id} 
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {student.Std_ID}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.Std_Name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          student.Gender === 'Male' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.Gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {todayAttendance.length > 0 ? (
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${
                              todayAttendance.find(a => a.student._id === student._id)?.status === 'present'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {todayAttendance.find(a => a.student._id === student._id)?.status === 'present' ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Present
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Absent
                                </>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => handleAttendanceChange(student._id, 'present')}
                              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                                attendance[student._id] === 'present'
                                  ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(student._id, 'absent')}
                              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                                attendance[student._id] === 'absent'
                                  ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Absent
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          {todayAttendance.length === 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveAttendance}
                disabled={loading}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving Attendance...' : 'Save Attendance'}</span>
              </button>
            </div>
          )}

          {todayAttendance.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-green-400 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Attendance Recorded Successfully!</p>
                  <p className="text-green-100 text-sm">Today's attendance for {selectedClass} has been saved. You cannot make changes.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedClass && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Class Selected</h3>
          <p className="text-gray-500">Please select a class to view and manage attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;