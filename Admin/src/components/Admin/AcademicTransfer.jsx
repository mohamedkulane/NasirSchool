// src/components/Admin/AcademicTransfer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ArrowRight, 
  Calendar, 
  BookOpen, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  UserPlus,
  Database,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { adminAPI } from '../../utils/api';

const AcademicTransfer = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [populateLoading, setPopulateLoading] = useState(false);
  const [totalActiveStudents, setTotalActiveStudents] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTransferControls, setShowTransferControls] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    academicYear: '',
    class: ''
  });

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    sourceAcademicYear: '2025-2026',
    targetAcademicYear: '2026-2027',
    sourceClass: 'class 1B',
    targetClass: 'class 2B',
    studentIds: []
  });

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [transferResult, setTransferResult] = useState(null);

  const classes = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  const academicYearOptions = [
    '2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030'
  ];

  // Use useMemo to filter students by class
  const filteredStudents = useMemo(() => {
    if (!filters.class) return students;
    return students.filter(student => {
      const studentClass = student.class || student.currentClass || student.Class;
      return studentClass === filters.class;
    });
  }, [students, filters.class]);

  useEffect(() => {
    fetchAcademicYears();
    fetchTotalActiveStudents();
    // Check screen width on load
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowTransferControls(false);
        setShowFilters(false);
      } else {
        setShowTransferControls(true);
        setShowFilters(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (filters.academicYear) {
      fetchStudents();
    }
  }, [filters]);

  const fetchTotalActiveStudents = async () => {
    try {
      const response = await adminAPI.getActiveStudentsCount();
      if (response.data.success) {
        setTotalActiveStudents(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching active students count:', error);
      if (students.length > 0) {
        setTotalActiveStudents(students.filter(s => s.status === 'active').length);
      }
    }
  };

  const fetchAcademicYears = async () => {
    try {
      console.log('Fetching academic years...');
      const response = await adminAPI.getAcademicYears();
      console.log('Response:', response.data);
      if (response.data.success) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      console.error('Error details:', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('Error loading academic years: ' + (error.response?.data?.error || error.message));
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { academicYear: filters.academicYear };
      if (filters.class) {
        params.class = filters.class;
      }
      
      const response = await adminAPI.getStudentsByAcademicYear(params);
      if (response.data.success) {
        setStudents(response.data.data);
        const activeCount = response.data.data.filter(s => s.status === 'active').length;
        if (!filters.class) {
          setTotalActiveStudents(prev => Math.max(prev, activeCount));
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateBaseAcademicYear = async () => {
    if (!window.confirm(`Ma hubtaa inaad ku darto dhammaan ardayda active-ka ah sanadka ${transferForm.sourceAcademicYear}?`)) {
      return;
    }

    setPopulateLoading(true);
    try {
      const payload = {
        academicYear: transferForm.sourceAcademicYear
      };
      
      const response = await adminAPI.populateBaseAcademicYear(payload);
      if (response.data.success) {
        alert(response.data.message);
        console.log('Populate result:', response.data);
        
        fetchAcademicYears();
        fetchStudents();
        fetchTotalActiveStudents();
        
        setTimeout(() => {
          handleInitializeAcademicYear();
        }, 1000);
      }
    } catch (error) {
      console.error('Populate error:', error);
      alert('Error populating base year: ' + error.message);
    } finally {
      setPopulateLoading(false);
    }
  };

  const handleSimplePopulate = async () => {
    if (!window.confirm(`Ku dar dhammaan ardayda active-ka ah sanadka 2025-2026?`)) {
      return;
    }

    try {
      const studentsResponse = await adminAPI.getStudents({});
      const activeStudents = studentsResponse.data.data || [];
      
      console.log(`Found ${activeStudents.length} active students`);
      
      let createdCount = 0;
      
      for (const student of activeStudents) {
        try {
          const checkResponse = await adminAPI.getStudentsByAcademicYear({
            academicYear: '2025-2026',
            class: student.Class || 'class 1B'
          });
          
          const existing = checkResponse.data.data?.find(
            item => item.student?._id === student._id
          );
          
          if (!existing) {
            await adminAPI.transferStudents({
              sourceAcademicYear: '2025-2026',
              targetAcademicYear: '2025-2026',
              sourceClass: student.Class || 'class 1B',
              targetClass: student.Class || 'class 1B',
              studentIds: [student._id]
            });
            createdCount++;
          }
        } catch (err) {
          console.log(`Error for student ${student.Std_ID}:`, err.message);
        }
      }
      
      alert(`Successfully created ${createdCount} academic history records for 2025-2026`);
      fetchStudents();
      fetchTotalActiveStudents();
      
    } catch (error) {
      console.error('Simple populate error:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentStudents = filters.class ? filteredStudents : students;
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(s => s.student._id));
    }
  };

  const handleTransfer = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!window.confirm(`Transfer ${selectedStudents.length} students from ${transferForm.sourceClass} to ${transferForm.targetClass}?`)) {
      return;
    }

    setTransferLoading(true);
    try {
      const payload = {
        ...transferForm,
        studentIds: selectedStudents
      };

      const response = await adminAPI.transferStudents(payload);
      if (response.data.success) {
        setTransferResult(response.data.data);
        alert(`Successfully transferred ${response.data.data.summary.transferred} students`);
        
        fetchStudents();
        fetchTotalActiveStudents();
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Error transferring students: ' + error.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleBulkTransfer = async () => {
    if (!window.confirm(`Transfer ALL students from ${transferForm.sourceClass} to ${transferForm.targetClass}?`)) {
      return;
    }

    setTransferLoading(true);
    try {
      const payload = {
        sourceAcademicYear: transferForm.sourceAcademicYear,
        targetAcademicYear: transferForm.targetAcademicYear,
        sourceClass: transferForm.sourceClass,
        targetClass: transferForm.targetClass
      };

      const response = await adminAPI.bulkTransferClass(payload);
      if (response.data.success) {
        setTransferResult(response.data.data);
        alert(`Bulk transfer completed: ${response.data.data.summary.transferred} students transferred`);
        fetchStudents();
        fetchTotalActiveStudents();
      }
    } catch (error) {
      console.error('Bulk transfer error:', error);
      alert('Error in bulk transfer: ' + error.message);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleInitializeAcademicYear = async () => {
    if (!window.confirm(`Initialize ${transferForm.targetAcademicYear} with students from ${transferForm.sourceAcademicYear}?`)) {
      return;
    }

    try {
      const payload = {
        targetAcademicYear: transferForm.targetAcademicYear,
        baseAcademicYear: transferForm.sourceAcademicYear
      };

      const response = await adminAPI.initializeAcademicYear(payload);
      if (response.data.success) {
        alert(response.data.message);
        fetchStudents();
        fetchTotalActiveStudents();
      }
    } catch (error) {
      console.error('Initialize error:', error);
      alert('Error initializing academic year: ' + error.message);
    }
  };

  const getClassPromotion = (currentClass) => {
    const classMap = {
      'class 1B': 'class 2B',
      'class 1T': 'class 2T',
      'class 1J': 'class 2B',
      'class 2B': 'class 3B',
      'class 2T': 'class 3T',
      'class 3B': 'class 4B',
      'class 3T': 'class 4T',
      'class 4B': 'class 5B',
      'class 4T': 'class 5T',
      'class 5B': 'class 6B',
      'class 5T': 'class 6B',
      'class 6B': 'class 7B',
      'class 7B': 'class 8B',
      'class 7T': 'class 8T',
      'class 8B': 'Form 1A',
      'class 8T': 'Form 1B',
      'Form 1A': 'Form 2A',
      'Form 1B': 'Form 2B',
      'Form 2A': 'Form 3A',
      'Form 2B': 'Form 3A',
      'Form 3A': 'Form 4A',
      'Form 4A': 'Graduated'
    };
    
    return classMap[currentClass] || currentClass;
  };

  const autoSetTargetClass = (sourceClass) => {
    setTransferForm(prev => ({
      ...prev,
      targetClass: getClassPromotion(sourceClass)
    }));
  };

  // Calculate stats
  const studentsIn2025_2026 = useMemo(() => {
    return students.filter(s => s.academicYear === '2025-2026').length;
  }, [students]);

  const studentsIn2026_2027 = useMemo(() => {
    return students.filter(s => s.academicYear === '2026-2027').length;
  }, [students]);

  const readyForTransfer = useMemo(() => {
    return students.filter(s => s.status === 'active' && s.academicYear === '2025-2026').length;
  }, [students]);

  return (
    <div className="space-y-4 p-2 md:p-4 lg:p-6">
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-[#4F200D]">Academic Transfer</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-[#4F200D] text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="space-y-3">
            <button
              onClick={handlePopulateBaseAcademicYear}
              disabled={populateLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg"
            >
              {populateLoading ? 'Processing...' : `Populate ${transferForm.sourceAcademicYear}`}
            </button>
            <button
              onClick={handleSimplePopulate}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg"
            >
              Add Students to 2025-2026
            </button>
            <button
              onClick={handleInitializeAcademicYear}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#4F200D] text-white rounded-lg"
            >
              Initialize {transferForm.targetAcademicYear}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Academic Transfer System</h1>
            <p className="text-sm md:text-base text-[#FFD93D]">Manage student promotions and academic year transitions</p>
            <div className="mt-2 text-xs md:text-sm text-white/80 flex flex-wrap items-center gap-2">
              <span className="bg-[#FFD93D]/20 px-2 py-1 rounded">{totalActiveStudents} Active Students</span>
              <span className="hidden sm:inline">•</span>
              <span>Current Base Year: 2025-2026</span>
            </div>
          </div>
          <div className="hidden md:flex items-center flex-wrap gap-2 lg:gap-3">
            <button
              onClick={handlePopulateBaseAcademicYear}
              disabled={populateLoading}
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm md:text-base"
              title="Ku dar dhammaan ardayda hore sanadka aasaasiga ah"
            >
              {populateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Populate</span> {transferForm.sourceAcademicYear}
                </>
              )}
            </button>

            <button
              onClick={handleSimplePopulate}
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 text-sm md:text-base"
              title="Ku dar ardayda hore si fudud"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Add Students</span>
              <span className="lg:hidden">Add to 2025-2026</span>
            </button>

            <button
              onClick={handleInitializeAcademicYear}
              className="flex items-center px-3 py-2 md:px-4 md:py-2 bg-white/20 text-white rounded-lg md:rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm md:text-base"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Initialize</span> {transferForm.targetAcademicYear}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Collapsible on Mobile */}
      <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-3 md:p-4 shadow-sm">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between md:hidden"
        >
          <h2 className="text-lg font-semibold text-[#4F200D]">Quick Stats</h2>
          {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <h2 className="hidden md:block text-lg font-semibold text-[#4F200D] mb-3 md:mb-4">Quick Stats</h2>
        
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white rounded-lg border border-[#FF9A00]/20 p-3 md:p-4 shadow-sm">
              <div className="flex items-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-[#4F200D] mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm text-[#4F200D]/70">Total Active</p>
                  <p className="text-lg md:text-2xl font-bold text-[#4F200D]">
                    {totalActiveStudents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    {students.length} in current view
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-[#FF9A00]/20 p-3 md:p-4 shadow-sm">
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-[#FF9A00] mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm text-[#4F200D]/70">In 2025-2026</p>
                  <p className="text-lg md:text-2xl font-bold text-[#4F200D]">
                    {studentsIn2025_2026}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    Base academic year
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-[#FF9A00]/20 p-3 md:p-4 shadow-sm">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-600 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm text-[#4F200D]/70">In 2026-2027</p>
                  <p className="text-lg md:text-2xl font-bold text-[#4F200D]">
                    {studentsIn2026_2027}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    Next academic year
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-[#FF9A00]/20 p-3 md:p-4 shadow-sm">
              <div className="flex items-center">
                <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm text-[#4F200D]/70">Ready for Transfer</p>
                  <p className="text-lg md:text-2xl font-bold text-[#4F200D]">
                    {readyForTransfer}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    From 2025-2026 to 2026-2027
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transfer Controls - Collapsible on Mobile */}
      <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-3 md:p-4 lg:p-5 shadow-sm">
        <button
          onClick={() => setShowTransferControls(!showTransferControls)}
          className="w-full flex items-center justify-between md:hidden"
        >
          <h2 className="text-lg font-semibold text-[#4F200D]">Transfer Configuration</h2>
          {showTransferControls ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <h2 className="hidden md:block text-lg font-semibold text-[#4F200D] mb-3 md:mb-4">Transfer Configuration</h2>
        
        {showTransferControls && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                  From Academic Year
                </label>
                <select
                  value={transferForm.sourceAcademicYear}
                  onChange={(e) => setTransferForm({...transferForm, sourceAcademicYear: e.target.value})}
                  className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
                >
                  {academicYearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                  From Class
                </label>
                <select
                  value={transferForm.sourceClass}
                  onChange={(e) => {
                    setTransferForm({...transferForm, sourceClass: e.target.value});
                    autoSetTargetClass(e.target.value);
                  }}
                  className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                  To Academic Year
                </label>
                <select
                  value={transferForm.targetAcademicYear}
                  onChange={(e) => setTransferForm({...transferForm, targetAcademicYear: e.target.value})}
                  className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
                >
                  {academicYearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                  To Class
                </label>
                <select
                  value={transferForm.targetClass}
                  onChange={(e) => setTransferForm({...transferForm, targetClass: e.target.value})}
                  className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 order-2 sm:order-1">
                <button
                  onClick={handleBulkTransfer}
                  className="w-full sm:w-auto flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-lg hover:shadow-lg transition-all duration-300 text-sm md:text-base"
                  disabled={transferLoading}
                >
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Transfer Entire Class
                </button>
                
                <button
                  onClick={handleTransfer}
                  className="w-full sm:w-auto flex items-center justify-center px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm md:text-base"
                  disabled={transferLoading || selectedStudents.length === 0}
                >
                  <ArrowRight className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Transfer Selected ({selectedStudents.length})
                </button>
              </div>

              <div className="text-xs md:text-sm text-[#4F200D]/70 order-1 sm:order-2">
                Auto-promotion: {transferForm.sourceClass} → {transferForm.targetClass}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters for Viewing Students - Collapsible on Mobile */}
      <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-3 md:p-4 lg:p-5 shadow-sm">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between md:hidden"
        >
          <h2 className="text-lg font-semibold text-[#4F200D]">View Students by Academic Year</h2>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <h2 className="hidden md:block text-lg font-semibold text-[#4F200D] mb-3 md:mb-4">View Students by Academic Year</h2>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                Academic Year
              </label>
              <select
                value={filters.academicYear}
                onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
              >
                <option value="">Select Academic Year</option>
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-[#4F200D] mb-1 md:mb-2">
                Class
              </label>
              <select
                value={filters.class}
                onChange={(e) => setFilters({...filters, class: e.target.value})}
                className="w-full px-2 py-1 md:px-3 md:py-2 border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#FF9A00] text-[#4F200D] text-sm md:text-base"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-[#FF9A00]/20 overflow-hidden shadow-sm">
        <div className="p-3 md:p-4 border-b border-[#FF9A00]/20 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-[#4F200D] mr-2" />
              <h3 className="font-semibold text-[#4F200D] text-sm md:text-base">
                Students {filters.academicYear ? `in ${filters.academicYear}` : ''} {filters.class ? `- ${filters.class}` : ''}
              </h3>
              <span className="ml-2 text-xs md:text-sm bg-[#4F200D] text-white px-2 py-0.5 md:px-2 md:py-1 rounded-full">
                {filteredStudents.length} students
              </span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs md:text-sm text-[#4F200D] hover:text-[#FF9A00]"
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-xs md:text-sm text-[#4F200D]/70">
                {selectedStudents.length} selected
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-[#FF9A00]"></div>
            <span className="ml-2 text-[#4F200D] text-sm md:text-base">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-[#4F200D]/60 px-2">
            <BookOpen className="mx-auto h-8 w-8 md:h-12 md:w-12 text-[#4F200D]/40 mb-2 md:mb-3" />
            <h3 className="text-base md:text-lg font-semibold text-[#4F200D] mb-1 md:mb-2">No students found</h3>
            <p className="text-sm md:text-base">
              {filters.class 
                ? `No students in ${filters.class} for ${filters.academicYear || 'selected academic year'}`
                : 'Select an academic year to view students'
              }
            </p>
            {!filters.academicYear && (
              <div className="mt-3 md:mt-4">
                <button
                  onClick={() => setFilters({...filters, academicYear: '2025-2026'})}
                  className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#4F200D] to-[#FF9A00] text-white rounded-lg hover:shadow-lg text-sm md:text-base"
                >
                  View Students in 2025-2026
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="md:hidden">
              {filteredStudents.map((record) => (
                <div key={record._id} className="p-3 border-b border-[#FF9A00]/20 hover:bg-[#F6F1E9]/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(record.student._id)}
                        onChange={() => handleStudentSelect(record.student._id)}
                        className="rounded border-[#FF9A00]/30 text-[#FF9A00] focus:ring-[#FF9A00]"
                      />
                      <div className="ml-2">
                        <div className="font-medium text-[#4F200D]">
                          {record.student.Std_Name}
                        </div>
                        <div className="text-xs text-[#4F200D]/70">
                          ID: {record.student.Std_ID}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      record.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : record.status === 'transferred'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-[#4F200D]/70">Parent</div>
                      <div className="text-[#4F200D] truncate">{record.student.parent_Name}</div>
                      <div className="text-xs text-[#4F200D]/70">{record.student.parent_phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#4F200D]/70">Class</div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] text-xs rounded">
                          {record.class}
                        </span>
                        <ArrowRight size={12} className="text-[#4F200D]/50" />
                        <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] text-xs rounded">
                          {getClassPromotion(record.class)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <table className="min-w-full divide-y divide-[#FF9A00]/20 hidden md:table">
              <thead className="bg-[#F6F1E9]">
                <tr>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#FF9A00]/30 text-[#FF9A00] focus:ring-[#FF9A00]"
                    />
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Student ID
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Student Name
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Parent Info
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Current Class
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Next Class
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-[#4F200D] uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#FF9A00]/20">
                {filteredStudents.map((record) => (
                  <tr key={record._id} className="hover:bg-[#F6F1E9]/50">
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(record.student._id)}
                        onChange={() => handleStudentSelect(record.student._id)}
                        className="rounded border-[#FF9A00]/30 text-[#FF9A00] focus:ring-[#FF9A00]"
                      />
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className="font-mono text-xs md:text-sm text-[#4F200D]">
                        {record.student.Std_ID}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="font-medium text-[#4F200D] text-sm md:text-base">
                        {record.student.Std_Name}
                      </div>
                      <div className="text-xs text-[#4F200D]/70">
                        {record.student.Gender}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="text-sm text-[#4F200D]">
                        {record.student.parent_Name}
                      </div>
                      <div className="text-xs text-[#4F200D]/70">
                        {record.student.parent_phone}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] text-xs font-medium rounded border border-[#FF9A00]/30">
                        {record.class}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] text-xs font-medium rounded border border-[#4F200D]/20">
                        {getClassPromotion(record.class)}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        record.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'transferred'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Results */}
      {transferResult && (
        <div className="bg-white rounded-xl md:rounded-2xl border border-[#FF9A00]/20 p-3 md:p-4 lg:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#4F200D] mb-3 md:mb-4">Transfer Results</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-green-900">Successfully Transferred</p>
                  <p className="text-lg md:text-2xl font-bold text-green-700">
                    {transferResult.summary?.transferred || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-red-900">Failed Transfers</p>
                  <p className="text-lg md:text-2xl font-bold text-red-700">
                    {transferResult.summary?.failed || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-blue-900">Total Processed</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-700">
                    {transferResult.summary?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {transferResult.failed && transferResult.failed.length > 0 && (
            <div className="mt-3 md:mt-4">
              <h4 className="font-medium text-[#4F200D] mb-1 md:mb-2 text-sm md:text-base">Failed Transfers:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 max-h-32 md:max-h-40 overflow-y-auto">
                {transferResult.failed.map((fail, index) => (
                  <div key={index} className="text-xs md:text-sm text-red-700 mb-1">
                    Student ID: {fail.studentId} - {fail.reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicTransfer;