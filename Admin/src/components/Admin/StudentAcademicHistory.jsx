// src/components/Admin/StudentAcademicHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Download, 
  Users,
  ChevronRight,
  Clock,
  Filter,
  Eye,
  User,
  GraduationCap,
  ArrowRight,
  Edit,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

const StudentAcademicHistory = () => {
  const [allHistories, setAllHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  const [filters, setFilters] = useState({
    academicYear: '',
    class: '',
    status: '',
    search: '',
    page: 1,
    limit: 20
  });

  const academicYearOptions = [
    { value: '', label: 'All Academic Years' },
    { value: '2025-2026', label: '2025-2026' },
    { value: '2026-2027', label: '2026-2027' },
    { value: '2027-2028', label: '2027-2028' },
    { value: '2028-2029', label: '2028-2029' },
    { value: '2029-2030', label: '2029-2030' }
  ];

  const classes = [
    '', 'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'transferred', label: 'Transferred' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'left', label: 'Left' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // ✅ Use useMemo to filter histories based on all filters
  const filteredHistories = useMemo(() => {
    let result = [...allHistories];

    // Filter by class
    if (filters.class) {
      result = result.filter(history => 
        history.class === filters.class
      );
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(history => 
        history.status === filters.status
      );
    }

    // Filter by search (student name or ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(history => {
        const studentName = history.student?.Std_Name?.toLowerCase() || '';
        const studentId = history.student?.Std_ID?.toLowerCase() || '';
        return studentName.includes(searchLower) || studentId.includes(searchLower);
      });
    }

    // Filter by academic year
    if (filters.academicYear) {
      result = result.filter(history => 
        history.academicYear === filters.academicYear
      );
    }

    return result;
  }, [allHistories, filters]);

  useEffect(() => {
    fetchAllHistories();
  }, []);

  // ✅ Fetch ALL histories once
  const fetchAllHistories = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllAcademicHistories();
      if (response.data.success) {
        setAllHistories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic histories:', error);
      alert('Error loading academic histories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async (studentId) => {
    try {
      const response = await adminAPI.getStudentAcademicHistory(studentId);
      if (response.data.success) {
        setStudentHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student history:', error);
      alert('Error loading student academic history');
    }
  };

  const viewStudentHistory = async (history) => {
    setSelectedStudent(history);
    await fetchStudentHistory(history.student._id);
  };

  // ✅ Update student status
  const updateStudentStatus = async (historyId, newStatus) => {
    try {
      const response = await adminAPI.updateAcademicHistoryStatus({
        historyId,
        status: newStatus
      });
      
      if (response.data.success) {
        alert('Status updated successfully!');
        
        // Update local state
        setAllHistories(prev => prev.map(history => 
          history._id === historyId 
            ? { ...history, status: newStatus } 
            : history
        ));
        
        // Update selected student if it's the same
        if (selectedStudent && selectedStudent._id === historyId) {
          setSelectedStudent(prev => ({ ...prev, status: newStatus }));
        }
        
        // Update student history
        setStudentHistory(prev => prev.map(record => 
          record._id === historyId 
            ? { ...record, status: newStatus } 
            : record
        ));
        
        setEditingStatus(null);
        setNewStatus('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  // ✅ Start editing status
  const startEditStatus = (historyId, currentStatus) => {
    setEditingStatus(historyId);
    setNewStatus(currentStatus);
  };

  // ✅ Cancel editing
  const cancelEditStatus = () => {
    setEditingStatus(null);
    setNewStatus('');
  };

  // ✅ Export filtered histories
  const exportHistories = () => {
    try {
      // Prepare data for export
      const exportData = filteredHistories.map(history => ({
        'Student ID': history.student?.Std_ID || 'N/A',
        'Student Name': history.student?.Std_Name || 'N/A',
        'Academic Year': history.academicYear || 'N/A',
        'Class': history.class || 'N/A',
        'Status': history.status || 'N/A',
        'Parent Name': history.student?.parent_Name || 'N/A',
        'Parent Phone': history.student?.parent_phone || 'N/A',
        'Gender': history.student?.Gender || 'N/A',
        'Created Date': new Date(history.createdAt).toLocaleDateString(),
        'Updated Date': new Date(history.updatedAt).toLocaleDateString()
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            `"${row[header] || ''}"`
          ).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `academic_histories_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Exported ${filteredHistories.length} records successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting histories: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'transferred': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graduated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'left': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <User className="h-4 w-4" />;
      case 'transferred': return <ArrowRight className="h-4 w-4" />;
      case 'graduated': return <GraduationCap className="h-4 w-4" />;
      case 'left': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // ✅ Get status count for stats
  const statusCounts = useMemo(() => {
    const counts = {
      active: 0,
      transferred: 0,
      graduated: 0,
      left: 0,
      inactive: 0,
      total: filteredHistories.length
    };
    
    filteredHistories.forEach(history => {
      if (history.status && counts[history.status] !== undefined) {
        counts[history.status]++;
      }
    });
    
    return counts;
  }, [filteredHistories]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Student Academic History</h1>
            <p className="text-[#FFD93D]">Track and manage student academic records across years</p>
            <div className="mt-2 text-sm text-white/80">
              <span className="bg-[#FFD93D]/20 px-2 py-1 rounded">{allHistories.length} Total Records</span>
              <span className="mx-2">•</span>
              <span>{filteredHistories.length} Filtered Records</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={exportHistories}
              className="flex items-center px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV ({filteredHistories.length})
            </button>
            <button
              onClick={fetchAllHistories}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className={`bg-green-50 border border-green-200 rounded-xl p-3 ${filters.status === 'active' ? 'ring-2 ring-green-300' : ''}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{statusCounts.active}</div>
            <div className="text-xs text-green-600">Active</div>
          </div>
        </div>
        <div className={`bg-blue-50 border border-blue-200 rounded-xl p-3 ${filters.status === 'transferred' ? 'ring-2 ring-blue-300' : ''}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{statusCounts.transferred}</div>
            <div className="text-xs text-blue-600">Transferred</div>
          </div>
        </div>
        <div className={`bg-purple-50 border border-purple-200 rounded-xl p-3 ${filters.status === 'graduated' ? 'ring-2 ring-purple-300' : ''}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{statusCounts.graduated}</div>
            <div className="text-xs text-purple-600">Graduated</div>
          </div>
        </div>
        <div className={`bg-red-50 border border-red-200 rounded-xl p-3 ${filters.status === 'left' ? 'ring-2 ring-red-300' : ''}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-700">{statusCounts.left}</div>
            <div className="text-xs text-red-600">Left</div>
          </div>
        </div>
        <div className={`bg-gray-50 border border-gray-200 rounded-xl p-3 ${filters.status === 'inactive' ? 'ring-2 ring-gray-300' : ''}`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{statusCounts.inactive}</div>
            <div className="text-xs text-gray-600">Inactive</div>
          </div>
        </div>
        <div className="bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#4F200D]">{statusCounts.total}</div>
            <div className="text-xs text-[#4F200D]/70">Total Filtered</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4F200D] mb-2">
              Academic Year
            </label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters({...filters, academicYear: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D]"
            >
              {academicYearOptions.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F200D] mb-2">
              Class
            </label>
            <select
              value={filters.class}
              onChange={(e) => setFilters({...filters, class: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D]"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls || 'All Classes'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F200D] mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F200D] mb-2">
              Search (Name/ID)
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-[#4F200D]/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                className="w-full pl-10 pr-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-[#4F200D]/70">
            Showing <span className="font-semibold">{filteredHistories.length}</span> of <span className="font-semibold">{allHistories.length}</span> records
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilters({
                academicYear: '',
                class: '',
                status: '',
                search: '',
                page: 1,
                limit: 20
              })}
              className="px-4 py-2 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/80 text-[#4F200D] rounded-lg hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20 transition-all duration-300 font-medium border border-[#FF9A00]/30"
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 p-3 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 rounded-lg border border-[#FF9A00]/30">
            <div className="flex items-center text-[#4F200D]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF9A00]"></div>
              <span className="ml-2 text-sm font-medium">Loading academic histories...</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student History List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#FF9A00]/20 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#FF9A00]/20 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-[#4F200D] mr-2" />
                  <h3 className="font-semibold text-[#4F200D]">Academic Records</h3>
                  <span className="ml-2 text-sm bg-[#4F200D] text-white px-2 py-1 rounded-full">
                    {filteredHistories.length} records
                  </span>
                </div>
                <div className="text-sm text-[#4F200D]/70">
                  {filters.class && `Class: ${filters.class}`}
                  {filters.status && ` | Status: ${filters.status}`}
                </div>
              </div>
            </div>

            {filteredHistories.length === 0 ? (
              <div className="text-center py-12 text-[#4F200D]/60">
                <BookOpen className="mx-auto h-12 w-12 text-[#4F200D]/40 mb-3" />
                <h3 className="text-lg font-semibold text-[#4F200D] mb-2">No academic records found</h3>
                <p>Try changing your filter criteria</p>
                {allHistories.length > 0 && (
                  <button
                    onClick={() => setFilters({
                      academicYear: '',
                      class: '',
                      status: '',
                      search: '',
                      page: 1,
                      limit: 20
                    })}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#4F200D] to-[#FF9A00] text-white rounded-lg hover:shadow-lg"
                  >
                    Show All Records ({allHistories.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#FF9A00]/20">
                  <thead className="bg-[#F6F1E9]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                        Academic Year
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#FF9A00]/20">
                    {filteredHistories.map((history) => (
                      <tr key={history._id} className="hover:bg-[#F6F1E9]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] rounded-lg flex items-center justify-center mr-3">
                              <Users className="h-5 w-5 text-[#4F200D]" />
                            </div>
                            <div>
                              <div className="font-medium text-[#4F200D]">
                                {history.student?.Std_Name || 'N/A'}
                              </div>
                              <div className="text-xs text-[#4F200D]/70">
                                ID: {history.student?.Std_ID || 'N/A'}
                              </div>
                              <div className="text-xs text-[#4F200D]/50">
                                {history.student?.parent_phone || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-[#4F200D]/70 mr-2" />
                            <span className="font-medium text-[#4F200D]">
                              {history.academicYear}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] text-xs font-medium rounded border border-[#FF9A00]/30">
                            {history.class}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {editingStatus === history._id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="text-xs px-2 py-1 border border-[#FF9A00]/30 rounded focus:outline-none focus:ring-1 focus:ring-[#FF9A00]"
                              >
                                {statusOptions.filter(opt => opt.value).map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => updateStudentStatus(history._id, newStatus)}
                                className="text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditStatus}
                                className="text-red-600 hover:text-red-800"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(history.status)}`}>
                                <span className="mr-1">
                                  {getStatusIcon(history.status)}
                                </span>
                                {history.status}
                              </span>
                              <button
                                onClick={() => startEditStatus(history._id, history.status)}
                                className="text-[#4F200D]/60 hover:text-[#FF9A00] ml-2"
                                title="Edit Status"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewStudentHistory(history)}
                            className="flex items-center px-3 py-1 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] text-xs font-medium rounded-lg hover:from-[#4F200D]/20 hover:to-[#4F200D]/10 transition-all duration-300 border border-[#4F200D]/20"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Student History Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#FF9A00]/20 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#FF9A00]/20 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#4F200D] mr-2" />
                  <h3 className="font-semibold text-[#4F200D]">
                    {selectedStudent ? selectedStudent.student?.Std_Name : 'Student Details'}
                  </h3>
                </div>
                {selectedStudent && (
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentHistory([]);
                    }}
                    className="text-[#4F200D]/60 hover:text-[#FF9A00]"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {!selectedStudent ? (
                <div className="text-center py-8 text-[#4F200D]/60">
                  <Eye className="mx-auto h-12 w-12 text-[#4F200D]/40 mb-3" />
                  <h3 className="text-lg font-semibold text-[#4F200D] mb-2">Select a Student</h3>
                  <p>Click "View History" to see detailed academic history</p>
                </div>
              ) : (
                <>
                  {/* Student Info */}
                  <div className="mb-6">
                    <h4 className="font-medium text-[#4F200D] mb-3">Student Information</h4>
                    <div className="bg-[#F6F1E9]/30 rounded-lg p-4 border border-[#FF9A00]/20">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Name:</span>
                          <span className="text-sm font-medium text-[#4F200D]">
                            {selectedStudent.student?.Std_Name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Student ID:</span>
                          <span className="text-sm font-medium text-[#4F200D]">
                            {selectedStudent.student?.Std_ID}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Parent:</span>
                          <span className="text-sm font-medium text-[#4F200D]">
                            {selectedStudent.student?.parent_Name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Phone:</span>
                          <span className="text-sm font-medium text-[#4F200D]">
                            {selectedStudent.student?.parent_phone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Current Class:</span>
                          <span className="text-sm font-medium text-[#4F200D]">
                            {selectedStudent.class}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4F200D]/70">Status:</span>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedStudent.status)} mr-2`}>
                              {selectedStudent.status}
                            </span>
                            <button
                              onClick={() => startEditStatus(selectedStudent._id, selectedStudent.status)}
                              className="text-[#4F200D]/60 hover:text-[#FF9A00]"
                              title="Edit Status"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Timeline */}
                  <div>
                    <h4 className="font-medium text-[#4F200D] mb-3">Academic Timeline</h4>
                    {studentHistory.length === 0 ? (
                      <div className="text-center py-4 text-[#4F200D]/60">
                        <BookOpen className="mx-auto h-8 w-8 text-[#4F200D]/40 mb-2" />
                        <p>No academic history found</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {studentHistory.map((record, index) => (
                          <div 
                            key={record._id} 
                            className={`p-3 rounded-lg border ${
                              index === 0 
                                ? 'bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 border-[#FF9A00]/30' 
                                : 'bg-[#F6F1E9]/30 border-[#FF9A00]/20'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-[#4F200D]/70 mr-2" />
                                <span className="font-medium text-[#4F200D]">
                                  {record.academicYear}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)} mr-2`}>
                                  {record.status}
                                </span>
                                <button
                                  onClick={() => startEditStatus(record._id, record.status)}
                                  className="text-[#4F200D]/60 hover:text-[#FF9A00]"
                                  title="Edit Status"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="text-sm text-[#4F200D] mb-1">
                              Class: <span className="font-medium">{record.class}</span>
                            </div>
                            
                            {record.transferredFrom && (
                              <div className="flex items-center text-xs text-[#4F200D]/70 mb-1">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                <span>Transferred from: {record.transferredFrom}</span>
                              </div>
                            )}
                            
                            {record.notes && (
                              <div className="text-xs text-[#4F200D]/60 mt-1 italic">
                                {record.notes}
                              </div>
                            )}
                            
                            <div className="text-xs text-[#4F200D]/40 mt-2 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(record.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicHistory;