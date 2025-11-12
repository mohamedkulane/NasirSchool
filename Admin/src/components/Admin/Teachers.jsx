import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Book, Users, UserCheck, Download } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    class: ''
  });

  const [formData, setFormData] = useState({
    T_Name: '',
    T_subject: [],
    T_Number: '',
    T_class: [],
    User_Name: '',
    password: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTeachers();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
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
    (filters.class === '' || teacher.T_class?.includes(filters.class))
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
        password: ''
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
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await adminAPI.deleteTeacher(id);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[#FF9A00]/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#4F200D] mb-2">Teachers Management</h1>
            <p className="text-[#4F200D]/80">Manage all teachers in the school system</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90 text-[#F6F1E9] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 rounded-lg p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]">Total Teachers</p>
              <p className="text-2xl font-bold text-[#4F200D] mt-1">{teachers.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-[#4F200D]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 rounded-lg p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]">Active Teachers</p>
              <p className="text-2xl font-bold text-[#4F200D] mt-1">{teachers.length}</p>
            </div>
            <Users className="h-8 w-8 text-[#4F200D]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#F6F1E9] to-[#FFD93D]/10 rounded-lg p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]">Subjects</p>
              <p className="text-2xl font-bold text-[#4F200D] mt-1">
                {new Set(teachers.flatMap(t => t.T_subject)).size}
              </p>
            </div>
            <Book className="h-8 w-8 text-[#4F200D]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 rounded-lg p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4F200D]">Classes</p>
              <p className="text-2xl font-bold text-[#4F200D] mt-1">
                {new Set(teachers.flatMap(t => t.T_class)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-[#4F200D]" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-[#FF9A00]/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4F200D]/60 h-4 w-4" />
              <input
                type="text"
                placeholder="Search teachers by name, username, or phone..."
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
            <option value="">All Subjects</option>
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
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
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
            <h3 className="text-lg font-semibold text-[#4F200D] mb-1">No Teachers Found</h3>
            <p className="text-[#4F200D]/60">No teachers match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Subjects
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Classes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF9A00]/20">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-[#F6F1E9]/50 transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] rounded-lg flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-[#4F200D]" />
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
                        {teacher.T_subject.slice(0, 3).map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] rounded font-medium border border-[#FF9A00]/30"
                          >
                            {subject}
                          </span>
                        ))}
                        {teacher.T_subject.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-[#F6F1E9] text-[#4F200D]/70 rounded font-medium border border-[#FF9A00]/20">
                            +{teacher.T_subject.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {teacher.T_class.slice(0, 3).map((cls, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 text-[#4F200D] rounded font-medium border border-[#FF9A00]/30"
                          >
                            {cls}
                          </span>
                        ))}
                        {teacher.T_class.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-[#F6F1E9] text-[#4F200D]/70 rounded font-medium border border-[#FF9A00]/20">
                            +{teacher.T_class.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-1 text-[#4F200D] hover:bg-[#FFD93D]/30 rounded transition-colors duration-200"
                          title="Edit Teacher"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="p-1 text-[#4F200D] hover:bg-[#FF9A00]/30 rounded transition-colors duration-200"
                          title="Delete Teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                      password: ''
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
                      Teacher Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.T_Name}
                      onChange={(e) => setFormData({ ...formData, T_Name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.T_Number}
                      onChange={(e) => setFormData({ ...formData, T_Number: e.target.value })}
                      className="w-full px-3 py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Enter phone number"
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
                      placeholder="Choose username"
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
                      placeholder={editingTeacher ? 'Leave blank to keep current' : 'Enter password'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4F200D] mb-2">
                    <Book className="h-4 w-4 inline mr-1 text-[#4F200D]" />
                    Subjects
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
                    Classes
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
                        password: ''
                      });
                    }}
                    className="px-4 py-2 text-[#4F200D] border border-[#FF9A00]/30 rounded-lg hover:bg-[#F6F1E9] transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
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