// src/components/Admin/ExamResults.jsx
import React, { useState, useEffect } from 'react';
import { Download, BookOpen, Award, Trophy, Users, Target } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    className: '',
    subject: '',
    exam_type: 'all'
  });

  const classes = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  const subjects = {
    'Primary': ['math', 'English', 'somali', 'Islamic', 'Arabic', 'science', 'cilmi_bulsho', 'Technology'],
    'Secondary': ['math', 'physics', 'biology', 'chemistry', 'somali', 'Islamic', 'Arabic', 'business', 'English', 'tariikh', 'geography', 'technology']
  };

  const examTypes = [
    { value: 'all', label: 'All Exams' },
    { value: 'monthly_one', label: 'Monthly One' },
    { value: 'midTerm', label: 'Mid Term' },
    { value: 'monthly_two', label: 'Monthly Two' },
    { value: 'Final', label: 'Final Exam' }
  ];

  useEffect(() => {
    if (filters.className) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [filters]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getExamResults(filters);
      if (response.data.success) {
        setResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
      alert('Error loading exam results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async () => {
    if (!filters.className) {
      alert('Please select a class first');
      return;
    }

    setExportLoading(true);
    try {
      const response = await adminAPI.exportExamResults(filters);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `exam_results_${filters.className}_${filters.subject || 'all'}_${filters.exam_type}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting results:', error);
      
      if (error.response?.status === 404) {
        alert('Export feature is not available. Please contact administrator.');
      } else if (error.response?.status === 500) {
        alert('Server error occurred during export. Please try again later.');
      } else if (error.message.includes('Network Error')) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert('Failed to export results. Please try again.');
      }
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate grade based on percentage
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] border border-[#FF9A00]/30';
      case 'A': return 'bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] border border-[#FF9A00]/30';
      case 'B+': return 'bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] border border-[#FF9A00]/20';
      case 'B': return 'bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] border border-[#FF9A00]/20';
      case 'C': return 'bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 text-[#4F200D] border border-[#FF9A00]/20';
      case 'D': return 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] border border-[#4F200D]/20';
      case 'F': return 'bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] border border-[#4F200D]/20';
      default: return 'bg-[#F6F1E9] text-[#4F200D] border border-[#FF9A00]/20';
    }
  };

  // ✅ FIXED: Process results for table display with proper field handling
  const getTableData = () => {
    if (results.length === 0) return [];

    const studentMap = {};
    
    results.forEach(result => {
      // Filter by exam type if specified
      if (filters.exam_type !== 'all' && result.exam_type !== filters.exam_type) {
        return;
      }
      
      // Filter by subject if specified
      if (filters.subject && result.subject !== filters.subject) {
        return;
      }
      
      // ✅ FIXED: Use correct student ID field with fallbacks
      const studentId = result.student?._id || result.studentId;
      if (!studentId) {
        console.log('Skipping result with no student ID:', result);
        return;
      }

      // ✅ FIXED: Get student data with proper field fallbacks
      const studentData = result.student || {};
      const studentCode = studentData.Std_ID || studentData.studentCode || studentData.code || `N${String(studentId).slice(-3).padStart(3, '0')}`;
      const studentName = studentData.Std_Name || studentData.name || studentData.fullName || 'Unknown Student';

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: studentData,
          studentCode: studentCode,
          studentName: studentName,
          subjects: {},
          subjectTotals: {},
          overallTotal: 0,
          totalPossible: 0,
          examCount: 0
        };
      }

      // Initialize subject if not exists
      const subjectName = result.subject;
      if (!studentMap[studentId].subjects[subjectName]) {
        studentMap[studentId].subjects[subjectName] = {
          monthly_one: 0,
          midTerm: 0,
          monthly_two: 0,
          Final: 0
        };
        studentMap[studentId].subjectTotals[subjectName] = 0;
      }

      // Add marks to subject exam type
      const examType = result.exam_type;
      const marks = result.marks || 0;
      const maxMarks = result.maxMarks || 100;

      studentMap[studentId].subjects[subjectName][examType] = marks;
      
      // Update subject total based on filter mode
      if (filters.exam_type === 'all') {
        studentMap[studentId].subjectTotals[subjectName] += marks;
      } else {
        studentMap[studentId].subjectTotals[subjectName] = marks;
      }

      // ✅ FIXED: Update overall totals with correct max marks
      studentMap[studentId].overallTotal += marks;
      studentMap[studentId].totalPossible += maxMarks;
      studentMap[studentId].examCount += 1;
    });

    // Convert to array and calculate percentages
    const studentResults = Object.values(studentMap)
      .map((student) => {
        // ✅ FIXED: Calculate percentage based on actual max marks
        const overallPercentage = student.totalPossible > 0 
          ? (student.overallTotal / student.totalPossible) * 100 
          : 0;

        return {
          ...student,
          overallPercentage,
          grade: calculateGrade(overallPercentage)
        };
      })
      // Sort by percentage and assign ranks
      .sort((a, b) => b.overallPercentage - a.overallPercentage)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    return studentResults;
  };

  // ✅ FIXED: Get all unique subjects from results
  const getAllSubjects = () => {
    const subjectSet = new Set();
    results.forEach(result => {
      if (!filters.subject || result.subject === filters.subject) {
        if (result.subject) {
          subjectSet.add(result.subject);
        }
      }
    });
    return Array.from(subjectSet).sort();
  };

  // ✅ FIXED: Calculate statistics with proper data
  const getStats = () => {
    const tableData = getTableData();
    if (tableData.length === 0) return null;

    const totalMarks = tableData.reduce((sum, student) => sum + student.overallTotal, 0);
    const totalPossible = tableData.reduce((sum, student) => sum + student.totalPossible, 0);
    const averagePercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

    const topStudent = tableData[0];

    return {
      averagePercentage: averagePercentage.toFixed(1),
      topStudent: topStudent.studentName,
      topScore: topStudent.overallPercentage.toFixed(1),
      totalStudents: tableData.length
    };
  };

  const tableData = getTableData();
  const allSubjects = getAllSubjects();
  const stats = getStats();

  // Check if we're showing all exams or specific exam
  const isAllExamsMode = filters.exam_type === 'all';
  const isSpecificExamType = !isAllExamsMode;

  return (
    <div className="space-y-6 p-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Exam Results</h1>
            <p className="text-[#FFD93D]">Track and analyze student exam performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={exportResults}
              disabled={!filters.className || loading || exportLoading || tableData.length === 0}
              className="flex items-center px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#FF9A00]/20 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#4F200D] mb-2">
              Class *
            </label>
            <select
              value={filters.className}
              onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
              disabled={loading}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4F200D] mb-2">
              Subject
            </label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
              disabled={!filters.className || loading}
            >
              <option value="">All Subjects</option>
              {Object.entries(subjects).map(([level, levelSubjects]) => (
                <optgroup key={level} label={level}>
                  {levelSubjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4F200D] mb-2">
              Exam Type
            </label>
            <select
              value={filters.exam_type}
              onChange={(e) => setFilters({ ...filters, exam_type: e.target.value })}
              className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
              disabled={loading}
            >
              {examTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ className: '', subject: '', exam_type: 'all' })}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/80 text-[#4F200D] rounded-lg hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20 transition-all duration-300 font-medium border border-[#FF9A00]/30"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 p-3 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 rounded-lg border border-[#FF9A00]/30">
            <div className="flex items-center text-[#4F200D]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF9A00]"></div>
              <span className="ml-2 text-sm font-medium">Loading results...</span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D]">
                <Target className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-[#4F200D]/70">Average %</p>
                <p className="text-lg font-bold text-[#4F200D]">{stats.averagePercentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D]">
                <Award className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-[#4F200D]/70">Top Student</p>
                <p className="text-sm font-bold text-[#4F200D] truncate">{stats.topStudent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D]">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-[#4F200D]/70">Top Score</p>
                <p className="text-lg font-bold text-[#4F200D]">{stats.topScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#FF9A00]/20 p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D]">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-[#4F200D]/70">Total Students</p>
                <p className="text-lg font-bold text-[#4F200D]">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-[#FF9A00]/20 overflow-hidden shadow-sm">
        {!filters.className ? (
          <div className="text-center py-12 text-[#4F200D]/60">
            <BookOpen className="mx-auto h-12 w-12 text-[#4F200D]/40 mb-3" />
            <h3 className="text-lg font-semibold text-[#4F200D] mb-2">No class selected</h3>
            <p>Please select a class to view exam results.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF9A00]"></div>
            <span className="ml-2 text-[#4F200D]">Loading exam results...</span>
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-12 text-[#4F200D]/60">
            <BookOpen className="mx-auto h-12 w-12 text-[#4F200D]/40 mb-3" />
            <h3 className="text-lg font-semibold text-[#4F200D] mb-2">No results found</h3>
            <p>
              No exam results found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#FF9A00]/20">
              <thead className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  
                  {/* Dynamic Subject Columns */}
                  {allSubjects.map(subject => (
                    <th key={subject} className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-[#4F200D]/80">
                      <div className="flex flex-col">
                        <span>{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                        <span className="text-[#FFD93D] text-xs font-normal">
                          {isSpecificExamType ? filters.exam_type : 'Total'}
                        </span>
                      </div>
                    </th>
                  ))}
                  
                  {/* Overall Total Column */}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-[#4F200D]/80">
                    Total Marks
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-[#4F200D]/80">
                    Total %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider bg-[#4F200D]/80">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#FF9A00]/20">
                {tableData.map((student, index) => (
                  <tr key={student.student._id || student.student.id} className="hover:bg-[#F6F1E9]/50 transition-colors duration-150">
                    {/* Rank */}
                    <td className="px-4 py-3 whitespace-nowrap border-b border-[#FF9A00]/20">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-[#FFD93D] to-[#FF9A00] text-[#4F200D]' :
                        index === 1 ? 'bg-gradient-to-r from-[#F6F1E9] to-[#FFD93D]/50 text-[#4F200D]' :
                        index === 2 ? 'bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 text-[#4F200D]' :
                        'bg-[#F6F1E9] text-[#4F200D]'
                      }`}>
                        {student.rank}
                      </span>
                    </td>
                    
                    {/* Student Info */}
                    <td className="px-4 py-3 whitespace-nowrap border-b border-[#FF9A00]/20">
                      <span className="font-mono text-xs font-medium text-[#4F200D] bg-[#F6F1E9] px-2 py-1 rounded border border-[#FF9A00]/20">
                        {student.studentCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#4F200D] border-b border-[#FF9A00]/20">
                      {student.studentName}
                    </td>
                    
                    {/* Subject Marks */}
                    {allSubjects.map(subject => {
                      const subjectTotal = student.subjectTotals[subject] || 0;
                      const subjectData = student.subjects[subject];
                      
                      return (
                        <td key={subject} className="px-4 py-3 text-center border-b border-[#FF9A00]/20">
                          {subjectData ? (
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-[#4F200D] text-sm">
                                {subjectTotal}
                              </span>
                              {isAllExamsMode && (
                                <span className="text-xs text-[#4F200D]/60 mt-1">
                                  {((subjectTotal / 400) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#4F200D]/40 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                    
                    {/* Overall Total Marks */}
                    <td className="px-4 py-3 text-center border-b border-[#FF9A00]/20 bg-[#F6F1E9]/30">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-[#4F200D] text-sm">
                          {student.overallTotal}
                        </span>
                        <span className="text-xs text-[#4F200D]/60 mt-1">
                          /{student.totalPossible}
                        </span>
                      </div>
                    </td>
                    
                    {/* Overall Percentage */}
                    <td className="px-4 py-3 text-center border-b border-[#FF9A00]/20 bg-[#F6F1E9]/30">
                      <span className={`font-bold text-sm ${
                        student.overallPercentage >= 80 ? 'text-[#4F200D]' :
                        student.overallPercentage >= 60 ? 'text-[#4F200D]' :
                        student.overallPercentage >= 40 ? 'text-[#4F200D]' : 'text-[#4F200D]'
                      }`}>
                        {student.overallPercentage.toFixed(1)}%
                      </span>
                    </td>
                    
                    {/* Grade */}
                    <td className="px-4 py-3 text-center border-b border-[#FF9A00]/20 bg-[#F6F1E9]/30">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResults;