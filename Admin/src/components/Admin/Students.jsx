import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    status: 'active',
    search: ''
  });
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const fileInputRef = useRef(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);

  const [formData, setFormData] = useState({
    Std_Name: '',
    parent_Name: '',
    parent_phone: '',
    Gender: 'Male',
    Class: '',
    Shift: 'morning',
    Status: 'active'
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudents(filters);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await adminAPI.updateStudent(editingStudent._id, formData);
      } else {
        await adminAPI.createStudent(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
      alert(editingStudent ? 'Student updated successfully!' : 'Student created successfully!');
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      Std_Name: student.Std_Name,
      parent_Name: student.parent_Name,
      parent_phone: student.parent_phone,
      Gender: student.Gender,
      Class: student.Class,
      Shift: student.Shift,
      Status: student.Status
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    const statusText = newStatus === 'unactive' ? 'inactive' : 'active';
    
    if (window.confirm(`Are you sure you want to mark this student as ${statusText}?`)) {
      try {
        await adminAPI.updateStudent(id, { Status: newStatus });
        fetchStudents();
        alert(`Student marked as ${statusText} successfully!`);
      } catch (error) {
        console.error('Error updating student status:', error);
        alert('Error updating student status');
      }
    }
  };

  const handleDelete = async (id, studentName) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      try {
        await adminAPI.deleteStudent(id);
        fetchStudents();
        alert('Student deleted successfully!');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  const exportStudents = async () => {
    try {
      console.log('Exporting students with class:', filters.class);
      
      const response = await adminAPI.exportStudents(filters.class);
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `students_${filters.class || 'all'}_${timestamp}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Students exported successfully!');
    } catch (error) {
      console.error('Error exporting students:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Export failed: ${errorMessage}`);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setImportFile(file);
    previewExcelFile(file);
  };

  const previewExcelFile = (file) => {
    const mockPreview = [
      {
        Std_Name: 'Ahmed Mohamed',
        parent_Name: 'Mohamed Ali',
        parent_phone: '0612345678',
        Gender: 'Male',
        Class: 'class 1B',
        Shift: 'morning',
        Status: 'active',
        valid: true
      },
      {
        Std_Name: 'Aisha Hassan',
        parent_Name: 'Hassan Omar',
        parent_phone: '0612345679',
        Gender: 'Female',
        Class: 'class 1T',
        Shift: 'morning',
        Status: 'active',
        valid: true
      }
    ];

    setImportPreview(mockPreview);
    setImportErrors([]);
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file first');
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await adminAPI.importStudents(formData);
      
      if (response.data.success) {
        alert(`Successfully imported ${response.data.imported} students!`);
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        fetchStudents();
      } else {
        alert('Import failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error importing students:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Import failed: ${errorMessage}`);
    } finally {
      setImportLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Std_Name: '',
      parent_Name: '',
      parent_phone: '',
      Gender: 'Male',
      Class: '',
      Shift: 'morning',
      Status: 'active'
    });
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Std_Name', 'parent_Name', 'parent_phone', 'Gender', 'Class', 'Shift', 'Status'],
      ['Ahmed Mohamed', 'Mohamed Ali', '0612345678', 'Male', 'class 1B', 'morning', 'active'],
      ['Aisha Hassan', 'Hassan Omar', '0612345679', 'Female', 'class 1T', 'morning', 'active']
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    templateData.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classes = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  // Filter and sort students
  const filteredStudents = students.filter(student =>
    student.Std_Name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    student.Std_ID?.toLowerCase().includes(filters.search.toLowerCase()) ||
    student.parent_Name?.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Sort students by name
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const nameA = a.Std_Name.toLowerCase();
    const nameB = b.Std_Name.toLowerCase();
    
    if (sortOrder === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-3 lg:p-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-[#FF9A00]/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-[#4F200D] mb-2">Students Management</h1>
            <p className="text-sm lg:text-base text-[#4F200D]/80">Manage all students in the school system</p>
          </div>
          <div className="flex flex-col lg:flex-row xs:flex-row gap-2 lg:gap-3">
            <button
              onClick={exportStudents}
              className="flex items-center justify-center px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm lg:text-base"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90 text-[#F6F1E9] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm lg:text-base"
            >
              <Upload className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span>Import</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm lg:text-base"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-[#FF9A00]/20">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="xs:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="h-3 w-3 lg:h-4 lg:w-4 text-[#4F200D]/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
              />
            </div>
          </div>
          <select
            value={filters.class}
            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
            className="px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
          >
            <option value="active">Active</option>
            <option value="unactive">Inactive</option>
            <option value="">All Status</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 rounded-lg p-3 lg:p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-[#4F200D]">Total Students</p>
              <p className="text-lg lg:text-2xl font-bold text-[#4F200D] mt-1">{students.length}</p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-[#4F200D]" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 rounded-lg p-3 lg:p-4 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-[#4F200D]">Active Students</p>
              <p className="text-lg lg:text-2xl font-bold text-[#4F200D] mt-1">
                {students.filter(s => s.Status === 'active').length}
              </p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-[#4F200D]" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#F6F1E9] to-[#FFD93D]/10 rounded-lg p-3 lg:p-4 border border-[#FF9A00]/30 xs:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-[#4F200D]">Classes</p>
              <p className="text-lg lg:text-2xl font-bold text-[#4F200D] mt-1">
                {new Set(students.map(s => s.Class)).size}
              </p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-[#4F200D]" />
          </div>
        </div>
      </div>

      {/* Students Table - Table Only */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FF9A00]/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF9A00]"></div>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-[#4F200D]/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#4F200D] mb-1">No Students Found</h3>
            <p className="text-[#4F200D]/60">No students match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20">
                <tr>
                  <th 
                    className="px-3 py-3 lg:px-4 lg:py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30 cursor-pointer hover:bg-[#FF9A00]/10 transition-colors"
                    onClick={toggleSortOrder}
                  >
                    <div className="flex items-center">
                      Student
                      <ArrowUpDown className="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                      <span className="text-xs ml-1">({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
                    </div>
                  </th>
                  <th className="px-3 py-3 lg:px-4 lg:py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Parent Info
                  </th>
                  <th className="px-3 py-3 lg:px-4 lg:py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Class & Shift
                  </th>
                  <th className="px-3 py-3 lg:px-4 lg:py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Status
                  </th>
                  <th className="px-3 py-3 lg:px-4 lg:py-3 text-left text-xs font-medium text-[#4F200D] uppercase tracking-wider border-b border-[#FF9A00]/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF9A00]/20">
                {sortedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-[#F6F1E9]/50 transition-colors duration-200">
                    <td className="px-3 py-3 lg:px-4 lg:py-3">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 lg:h-5 lg:w-5 text-[#4F200D]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#4F200D] text-sm lg:text-base truncate">{student.Std_Name}</div>
                          <div className="text-xs lg:text-sm text-[#4F200D]/70 truncate">{student.Std_ID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 lg:px-4 lg:py-3">
                      <div className="space-y-1">
                        <div className="text-sm text-[#4F200D] truncate">{student.parent_Name}</div>
                        <div className="flex items-center text-xs lg:text-sm text-[#4F200D]/70">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{student.parent_phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 lg:px-4 lg:py-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-1 bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] text-xs lg:text-sm font-medium rounded border border-[#FF9A00]/30">
                          {student.Class}
                        </span>
                        <div className="text-xs lg:text-sm text-[#4F200D]/70 capitalize">
                          {student.Shift} Shift
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 lg:px-4 lg:py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.Status === 'active' 
                          ? 'bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] border border-[#FF9A00]/30' 
                          : 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] border border-[#4F200D]/20'
                      }`}>
                        {student.Status}
                      </span>
                    </td>
                    <td className="px-3 py-3 lg:px-4 lg:py-3">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1 text-[#4F200D] hover:bg-[#FFD93D]/30 rounded transition-colors duration-200"
                          title="Edit Student"
                        >
                          <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(
                            student._id, 
                            student.Status === 'active' ? 'unactive' : 'active'
                          )}
                          className="p-1 text-[#4F200D] hover:bg-[#FF9A00]/30 rounded transition-colors duration-200"
                          title={student.Status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                        >
                          {student.Status === 'active' ? (
                            <XCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          ) : (
                            <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.Std_Name)}
                          className="p-1 text-[#4F200D] hover:bg-[#FF9A00]/30 rounded transition-colors duration-200"
                          title="Delete Student"
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
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

      {/* Rest of the code remains exactly the same */}
      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#FF9A00]/30 mx-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-[#4F200D]">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="p-1 text-[#4F200D]/60 hover:text-[#4F200D]"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Std_Name}
                      onChange={(e) => setFormData({ ...formData, Std_Name: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parent_Name}
                      onChange={(e) => setFormData({ ...formData, parent_Name: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Enter parent name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Parent Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.Gender}
                      onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Class *
                    </label>
                    <select
                      required
                      value={formData.Class}
                      onChange={(e) => setFormData({ ...formData, Class: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4F200D] mb-1">
                      Shift
                    </label>
                    <select
                      value={formData.Shift}
                      onChange={(e) => setFormData({ ...formData, Shift: e.target.value })}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4F200D] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                    className="w-full px-3 py-2 text-sm lg:text-base border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent bg-[#F6F1E9]/50"
                  >
                    <option value="active">Active</option>
                    <option value="unactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#FF9A00]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStudent(null);
                      resetForm();
                    }}
                    className="px-3 lg:px-4 py-2 text-sm lg:text-base text-[#4F200D] border border-[#FF9A00]/30 rounded-lg hover:bg-[#F6F1E9] transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 lg:px-4 py-2 text-sm lg:text-base bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Students Modal - Exactly the same as before */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#FF9A00]/30 mx-auto">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-[#4F200D]">
                  Import Students from Excel
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                  className="p-1 text-[#4F200D]/60 hover:text-[#4F200D]"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-[#FF9A00]/30 rounded-lg p-4 lg:p-6 text-center bg-[#F6F1E9]/30">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                  
                  {!importFile ? (
                    <div>
                      <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-[#4F200D]/40 mx-auto mb-3" />
                      <p className="text-base lg:text-lg text-[#4F200D] mb-2">Select Excel File</p>
                      <p className="text-sm lg:text-base text-[#4F200D]/60 mb-4">Supports .xlsx and .xls formats</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        Choose File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CheckCircle className="h-10 w-10 lg:h-12 lg:w-12 text-[#4F200D] mx-auto mb-3" />
                      <p className="text-base lg:text-lg text-[#4F200D] mb-2">File Selected</p>
                      <p className="text-sm lg:text-base text-[#4F200D]/60 mb-2">{importFile.name}</p>
                      <p className="text-sm text-[#4F200D] mb-4">
                        Ready to import {importPreview.length} students
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-[#4F200D] border border-[#FF9A00]/30 rounded-lg hover:bg-[#F6F1E9] transition-colors duration-200 mr-2"
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>

                {/* Download Template */}
                <div className="text-center">
                  <button
                    onClick={downloadTemplate}
                    className="text-[#4F200D] hover:text-[#FF9A00] underline transition-colors duration-200 text-sm lg:text-base"
                  >
                    Download Excel Template
                  </button>
                </div>

                {/* Preview Section */}
                {importPreview.length > 0 && (
                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-[#4F200D] mb-3">
                      Preview ({importPreview.length} students)
                    </h4>
                    <div className="bg-[#F6F1E9]/30 rounded-lg border border-[#FF9A00]/30 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm lg:text-base min-w-[600px]">
                          <thead className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20">
                            <tr>
                              <th className="px-2 lg:px-3 py-2 text-left text-xs lg:text-sm font-medium text-[#4F200D]">Student Name</th>
                              <th className="px-2 lg:px-3 py-2 text-left text-xs lg:text-sm font-medium text-[#4F200D]">Parent Name</th>
                              <th className="px-2 lg:px-3 py-2 text-left text-xs lg:text-sm font-medium text-[#4F200D]">Phone</th>
                              <th className="px-2 lg:px-3 py-2 text-left text-xs lg:text-sm font-medium text-[#4F200D]">Class</th>
                              <th className="px-2 lg:px-3 py-2 text-left text-xs lg:text-sm font-medium text-[#4F200D]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((student, index) => (
                              <tr key={index} className="border-b border-[#FF9A00]/20">
                                <td className="px-2 lg:px-3 py-2 text-[#4F200D]">{student.Std_Name}</td>
                                <td className="px-2 lg:px-3 py-2 text-[#4F200D]">{student.parent_Name}</td>
                                <td className="px-2 lg:px-3 py-2 text-[#4F200D]">{student.parent_phone}</td>
                                <td className="px-2 lg:px-3 py-2 text-[#4F200D]">{student.Class}</td>
                                <td className="px-2 lg:px-3 py-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    student.valid 
                                      ? 'bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] border border-[#FF9A00]/30' 
                                      : 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] border border-[#4F200D]/20'
                                  }`}>
                                    {student.valid ? 'Valid' : 'Invalid'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#FF9A00]/20">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportPreview([]);
                    }}
                    className="px-3 lg:px-4 py-2 text-sm lg:text-base text-[#4F200D] border border-[#FF9A00]/30 rounded-lg hover:bg-[#F6F1E9] transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importLoading}
                    className="px-3 lg:px-4 py-2 text-sm lg:text-base bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {importLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-[#4F200D] mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      'Import Students'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;