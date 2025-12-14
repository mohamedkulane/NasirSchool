import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Mail, Phone, Book, Users, 
  UserCheck, Download, Lock, Unlock, Filter, Calendar,
  ChevronDown, ChevronUp, Check, X, Eye
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    class: '',
    loginStatus: 'all'
  });
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [formData, setFormData] = useState({
    T_Name: '',
    T_subject: [],
    T_Number: '',
    T_class: [],
    User_Name: '',
    password: '',
    loginAllowed: true
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTeachers();
      if (response.data.success) {
        const teachersWithSelection = response.data.data.map(teacher => ({
          ...teacher,
          selected: false
        }));
        setTeachers(teachersWithSelection);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersWithStatus = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTeachersLoginStatus();
      if (response.data.success) {
        const teachersWithSelection = response.data.data.map(teacher => ({
          ...teacher,
          selected: false
        }));
        setTeachers(teachersWithSelection);
      }
    } catch (error) {
      console.error('Error fetching teachers status:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    'math', 'English', 'somali', 'Islamic', 'Arabic', 'science', 'cilmi_bulsho', 'Technology',
    'physics', 'biology', 'chemistry', 'business', 'tariikh', 'geography'
  ];

  const classes = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     teacher.User_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     teacher.T_Number?.includes(searchTerm)) &&
    (filters.subject === '' || teacher.T_subject?.includes(filters.subject)) &&
    (filters.class === '' || teacher.T_class?.includes(filters.class)) &&
    (filters.loginStatus === 'all' || 
     (filters.loginStatus === 'allowed' && teacher.loginAllowed) ||
     (filters.loginStatus === 'blocked' && !teacher.loginAllowed))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await adminAPI.updateTeacher(editingTeacher._id, formData);
      } else {
        await adminAPI.createTeacher(formData);
      }
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({
        T_Name: '',
        T_subject: [],
        T_Number: '',
        T_class: [],
        User_Name: '',
        password: '',
        loginAllowed: true
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      T_Name: teacher.T_Name,
      T_subject: teacher.T_subject,
      T_Number: teacher.T_Number,
      T_class: teacher.T_class,
      User_Name: teacher.User_Name,
      password: '',
      loginAllowed: teacher.loginAllowed !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ma hubtaa inaad tirtirto macallinkan?')) {
      try {
        await adminAPI.deleteTeacher(id);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  // ✅ Login Control Functions
  const handleBlockTeacher = async (teacherId) => {
    if (window.confirm('Ma hubtaa inaad joojiso login-ka macallinkan?')) {
      try {
        await adminAPI.denyTeacherLogin(teacherId);
        fetchTeachers();
        alert('Login-ka macallinka waa la joojiyay!');
      } catch (error) {
        console.error('Error blocking teacher:', error);
        alert('Qalad ayaa dhacay: ' + error.message);
      }
    }
  };

  const handleAllowTeacher = async (teacherId) => {
    if (window.confirm('Ma hubtaa inaad fasaxdo login-ka macallinkan?')) {
      try {
        await adminAPI.allowTeacherLogin(teacherId);
        fetchTeachers();
        alert('Login-ka macallinka waa la fasaxay!');
      } catch (error) {
        console.error('Error allowing teacher:', error);
        alert('Qalad ayaa dhacay: ' + error.message);
      }
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const exportTeachers = async () => {
    try {
      const response = await adminAPI.exportTeachers();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting teachers:', error);
    }
  };

  // ✅ Selection Functions
  const toggleTeacherSelection = (teacherId) => {
    setTeachers(teachers.map(teacher => 
      teacher._id === teacherId 
        ? { ...teacher, selected: !teacher.selected }
        : teacher
    ));
  };

  const toggleSelectAll = () => {
    const allSelected = teachers.every(teacher => teacher.selected);
    setTeachers(teachers.map(teacher => ({
      ...teacher,
      selected: !allSelected
    })));
  };

  // ✅ Bulk Actions
  const handleBulkBlock = async () => {
    const selectedIds = teachers
      .filter(t => t.selected && t.loginAllowed)
      .map(t => t._id);
    
    if (selectedIds.length === 0) {
      alert('Fadlan dooro macalliminta aad joojinayso login-ka');
      return;
    }
    
    if (window.confirm(`Ma hubtaa inaad joojiso login-ka ${selectedIds.length} macallim?`)) {
      try {
        await adminAPI.bulkDenyTeacherLogin(selectedIds);
        fetchTeachers();
        setSelectedTeachers([]);
        alert(`${selectedIds.length} macallim ayaa loo joojiyay login-ka`);
      } catch (error) {
        console.error('Error bulk blocking:', error);
        alert('Qalad ayaa dhacay: ' + error.message);
      }
    }
  };

  const handleBulkAllow = async () => {
    const selectedIds = teachers
      .filter(t => t.selected && !t.loginAllowed)
      .map(t => t._id);
    
    if (selectedIds.length === 0) {
      alert('Fadlan dooro macalliminta aad fasaxayso login-ka');
      return;
    }
    
    if (window.confirm(`Ma hubtaa inaad fasaxdo login-ka ${selectedIds.length} macallim?`)) {
      try {
        // Note: We don't have bulkAllow API, so we'll do individual calls
        for (const id of selectedIds) {
          await adminAPI.allowTeacherLogin(id);
        }
        fetchTeachers();
        setSelectedTeachers([]);
        alert(`${selectedIds.length} macallim ayaa loo fasaxay login-ka`);
      } catch (error) {
        console.error('Error bulk allowing:', error);
        alert('Qalad ayaa dhacay: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = teachers
      .filter(t => t.selected)
      .map(t => t._id);
    
    if (selectedIds.length === 0) {
      alert('Fadlan dooro macalliminta aad tirtirito');
      return;
    }
    
    if (window.confirm(`Ma hubtaa inaad tirtirto ${selectedIds.length} macallim?`)) {
      try {
        // Note: We'll delete one by one since we don't have bulk delete
        for (const id of selectedIds) {
          await adminAPI.deleteTeacher(id);
        }
        fetchTeachers();
        setSelectedTeachers([]);
        alert(`${selectedIds.length} macallim ayaa la tirtiray`);
      } catch (error) {
        console.error('Error bulk deleting:', error);
        alert('Qalad ayaa dhacay: ' + error.message);
      }
    }
  };

  // Calculate stats
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.loginAllowed !== false).length;
  const blockedTeachers = teachers.filter(t => !t.loginAllowed).length;
  const selectedCount = teachers.filter(t => t.selected).length;

  const toggleExpand = (teacherId) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const viewTeacherDetails = (teacherId) => {
    // Navigate to teacher details page or show modal
    console.log('View teacher details:', teacherId);
    // You can implement this based on your routing
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[#FF9A00]/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#4F200D] mb-2">Maamulka Macalliminta</h1>
            <p className="text-[#4F200D]/80">Maamul macallimiinta iyo xakamaynta login-kooda</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => {
                setShowModal(true);
                setEditingTeacher(null);
                setFormData({
                  T_Name: '',
                  T_subject: [],
                  T_Number: '',
                  T_class: [],
                  User_Name: '',
                  password: '',
                  loginAllowed: true
                });
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90 text-[#F6F1E9] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Macallin Cusub
            </button>
            <button
              onClick={exportTeachers}
              className="flex items-center px-4 py-2 border border-[#FF9A00] text-[#FF9A00] rounded-lg hover:bg-[#FF9A00]/10 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Soo deji
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 rounded-lg p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]">Wadarta Macallimiinta</p>
              <p className="text-2xl font-bold text-[#4F200D] mt-1">{totalTeachers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-[#4F200D]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-lg p-4 border border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Login Fasaxan</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeTeachers}</p>
            </div>
            <Unlock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4 border border-red-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Login Joojiyay</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{blockedTeachers}</p>
            </div>
            <Lock className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4 border border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Kuwa la dooray</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{selectedCount}</p>
            </div>
            <Check className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                {selectedCount} macallim ayaa la dooray
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkAllow}
                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                <Unlock className="h-4 w-4 mr-1" />
                Fasaxi Login
              </button>
              <button
                onClick={handleBulkBlock}
                className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Lock className="h-4 w-4 mr-1" />
                Jooji Login
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Tirtir
              </button>
              <button
                onClick={() => setTeachers(teachers.map(t => ({ ...t, selected: false })))}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <X className="h-4 w-4 mr-1" />
                Iska saar doorashada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-[#FF9A00]/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4F200D]/60 h-4 w-4" />
              <input
                type="text"
                placeholder="Raadi macallimiin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
              />
            </div>
          </div>
          
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
          >
            <option value="">Dhammaan Mawduucyada</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            className="px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
          >
            <option value="">Dhammaan Faslada</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={filters.loginStatus}
            onChange={(e) => setFilters({ ...filters, loginStatus: e.target.value })}
            className="px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
          >
            <option value="all">Dhammaan Login-ka</option>
            <option value="allowed">Login Fasaxan</option>
            <option value="blocked">Login Joojiyay</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FF9A00]/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF9A00]"></div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 text-[#4F200D]/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#4F200D] mb-1">Macallimiin lama helin</h3>
            <p className="text-[#4F200D]/60">Wax raadin lama helin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    <input
                      type="checkbox"
                      checked={teachers.length > 0 && teachers.every(t => t.selected)}
                      onChange={toggleSelectAll}
                      className="rounded border-[#FF9A00] text-[#FF9A00] focus:ring-[#FF9A00]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Macallin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Xiriir
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Mawduucyada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Faslada
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Login Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Tallaabooyin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF9A00]/20">
                {filteredTeachers.map((teacher) => (
                  <React.Fragment key={teacher._id}>
                    <tr className={`hover:bg-[#F6F1E9]/50 transition-colors duration-200 ${expandedTeacher === teacher._id ? 'bg-[#F6F1E9]/30' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={teacher.selected || false}
                          onChange={() => toggleTeacherSelection(teacher._id)}
                          className="rounded border-[#FF9A00] text-[#FF9A00] focus:ring-[#FF9A00]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            teacher.loginAllowed !== false 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : 'bg-gradient-to-r from-red-500 to-red-400'
                          }`}>
                            <UserCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-[#4F200D]">{teacher.T_Name}</div>
                            <div className="flex items-center text-[#4F200D]/70 text-sm mt-1">
                              <Mail className="h-3 w-3 mr-1" />
                              @{teacher.User_Name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-[#4F200D]">
                          <Phone className="h-4 w-4 mr-2 text-[#4F200D]/60" />
                          <span className="font-medium">{teacher.T_Number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {teacher.T_subject?.slice(0, 3).map((subject, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] rounded font-medium border border-[#FF9A00]/30"
                            >
                              {subject}
                            </span>
                          ))}
                          {teacher.T_subject?.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-[#F6F1E9] text-[#4F200D]/70 rounded font-medium border border-[#FF9A00]/20">
                              +{teacher.T_subject.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {teacher.T_class?.slice(0, 3).map((cls, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 text-[#4F200D] rounded font-medium border border-[#FF9A00]/30"
                            >
                              {cls}
                            </span>
                          ))}
                          {teacher.T_class?.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-[#F6F1E9] text-[#4F200D]/70 rounded font-medium border border-[#FF9A00]/20">
                              +{teacher.T_class.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          teacher.loginAllowed !== false 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {teacher.loginAllowed !== false ? (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Login Fasaxan
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Login Joojiyay
                            </>
                          )}
                        </div>
                        {teacher.lastLogin && (
                          <div className="text-xs text-[#4F200D]/60 mt-1">
                            Ugu dambeeyay: {new Date(teacher.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewTeacherDetails(teacher._id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Daawo"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-1 text-[#4F200D] hover:bg-[#FFD93D]/30 rounded transition-colors duration-200"
                            title="Beddel"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {teacher.loginAllowed !== false ? (
                            <button
                              onClick={() => handleBlockTeacher(teacher._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                              title="Jooji Login"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAllowTeacher(teacher._id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                              title="Fasaxi Login"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(teacher._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Tirtir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleExpand(teacher._id)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors duration-200"
                            title="More"
                          >
                            {expandedTeacher === teacher._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedTeacher === teacher._id && (
                      <tr className="bg-[#F6F1E9]/30">
                        <td colSpan="7" className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded-lg border border-[#FF9A00]/20">
                            <div>
                              <h4 className="font-medium text-[#4F200D] mb-2">Macluumaadka Login-ka</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[#4F200D]/70">Username:</span>
                                  <span className="font-medium">{teacher.User_Name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#4F200D]/70">Status:</span>
                                  <span className={`font-medium ${teacher.loginAllowed !== false ? 'text-green-600' : 'text-red-600'}`}>
                                    {teacher.loginAllowed !== false ? 'Fasaxan' : 'Joojiyay'}
                                  </span>
                                </div>
                                {teacher.lastLogin && (
                                  <div className="flex justify-between">
                                    <span className="text-[#4F200D]/70">Ugu dambeeyay login:</span>
                                    <span className="font-medium">
                                      {new Date(teacher.lastLogin).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-[#4F200D]/70">Lagu dhisay:</span>
                                  <span className="font-medium">
                                    {new Date(teacher.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-[#4F200D] mb-2">Wadarta Mawduucyada</h4>
                              <div className="flex flex-wrap gap-1">
                                {teacher.T_subject?.map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] rounded"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-[#4F200D] mb-2">Wadarta Faslada</h4>
                              <div className="flex flex-wrap gap-1">
                                {teacher.T_class?.map((cls, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 text-[#4F200D] rounded"
                                  >
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#FF9A00]/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#4F200D]">
                  {editingTeacher ? 'Beddel Macallin' : 'Macallin Cusub'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTeacher(null);
                    setFormData({
                      T_Name: '',
                      T_subject: [],
                      T_Number: '',
                      T_class: [],
                      User_Name: '',
                      password: '',
                      loginAllowed: true
                    });
                  }}
                  className="p-1 text-[#4F200D]/60 hover:text-[#4F200D]"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Magaca Macallinka *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.T_Name}
                      onChange={(e) => setFormData({ ...formData, T_Name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Gali magaca buuxa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Lambarka Taleefanka *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.T_Number}
                      onChange={(e) => setFormData({ ...formData, T_Number: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Gali lambarka taleefanka"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.User_Name}
                      onChange={(e) => setFormData({ ...formData, User_Name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Dooro username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Password {!editingTeacher && '*'}
                    </label>
                    <input
                      type="password"
                      required={!editingTeacher}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder={editingTeacher ? 'Ka tag inaan beddelin' : 'Gali password'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-[#4F200D] mb-1">
                      <input
                        type="checkbox"
                        checked={formData.loginAllowed}
                        onChange={(e) => setFormData({ ...formData, loginAllowed: e.target.checked })}
                        className="rounded border-[#FF9A00] text-[#FF9A00] focus:ring-[#FF9A00]"
                      />
                      <span>Login fasax</span>
                    </label>
                    <p className="text-xs text-[#4F200D]/60">
                      Haddii la saaro, macallinku wuu galayaa system-ka
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4F200D] mb-2">
                    <Book className="h-4 w-4 inline mr-1 text-[#4F200D]" />
                    Mawduucyada
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-3 bg-[#F6F1E9]/30 border border-[#FF9A00]/30 rounded-lg">
                    {subjects.map((subject) => (
                      <label key={subject} className="flex items-center space-x-2 p-1 hover:bg-[#FFD93D]/20 rounded cursor-pointer transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.T_subject.includes(subject)}
                          onChange={() => setFormData({
                            ...formData,
                            T_subject: toggleArrayItem(formData.T_subject, subject)
                          })}
                          className="rounded border-[#FF9A00] text-[#FF9A00] focus:ring-[#FF9A00]"
                        />
                        <span className="text-sm text-[#4F200D] capitalize">
                          {subject}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4F200D] mb-2">
                    <Users className="h-4 w-4 inline mr-1 text-[#4F200D]" />
                    Faslada
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-3 bg-[#F6F1E9]/30 border border-[#FF9A00]/30 rounded-lg">
                    {classes.map((cls) => (
                      <label key={cls} className="flex items-center space-x-2 p-1 hover:bg-[#FFD93D]/20 rounded cursor-pointer transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.T_class.includes(cls)}
                          onChange={() => setFormData({
                            ...formData,
                            T_class: toggleArrayItem(formData.T_class, cls)
                          })}
                          className="rounded border-[#FF9A00] text-[#FF9A00] focus:ring-[#FF9A00]"
                        />
                        <span className="text-sm text-[#4F200D]">
                          {cls}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#FF9A00]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTeacher(null);
                      setFormData({
                        T_Name: '',
                        T_subject: [],
                        T_Number: '',
                        T_class: [],
                        User_Name: '',
                        password: '',
                        loginAllowed: true
                      });
                    }}
                    className="px-4 py-2 text-[#4F200D] border border-[#FF9A00]/30 rounded-lg hover:bg-[#F6F1E9] transition-colors duration-200"
                  >
                    Iska saar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {editingTeacher ? 'Beddel Macallin' : 'Ku dar Macallin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;