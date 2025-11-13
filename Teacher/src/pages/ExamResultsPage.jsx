import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import { 
  BookOpen, 
  Users, 
  Search, 
  Award, 
  Calculator,
  Filter,
  Download,
  Edit3,
  Save
} from 'lucide-react';

const ExamResultsPage = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [examTypes] = useState(['monthly_one', 'midTerm', 'monthly_two', 'Final']);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingInputs, setEditingInputs] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setClasses(user.classes || []);
      setSubjects(user.subjects || []);
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
      fetchExamResults();
    }
  }, [selectedClass, selectedSubject]);

  const fetchStudentsByClass = async () => {
    try {
      const response = await teacherAPI.getStudentsByClass(selectedClass);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchExamResults = async () => {
    try {
      const params = { class: selectedClass };
      if (selectedSubject) params.subject = selectedSubject;
      
      const response = await teacherAPI.getExamResults(params);
      if (response.data.success) {
        setExamResults(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch exam results');
    }
  };

  const handleInputChange = (studentId, examType, value) => {
    // Only allow numbers, decimal point, and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEditingInputs(prev => ({
        ...prev,
        [`${studentId}-${examType}`]: value
      }));
    }
  };

  const handleSaveResult = async (studentId, subject, examType, marks) => {
    try {
      console.log('Saving result:', { studentId, subject, examType, marks });

      // Validate marks based on exam type
      const maxMarks = {
        monthly_one: 10,
        midTerm: 20,
        monthly_two: 10,
        Final: 60
      };

      // Allow empty string for clearing marks
      if (marks === '' || marks === null) {
        // If marks are cleared, delete the existing result if it exists
        const existingResult = examResults.find(result => 
          result.student._id === studentId && 
          result.subject === selectedSubject && 
          result.exam_type === examType
        );

        if (existingResult) {
          await teacherAPI.deleteExamResult(existingResult._id);
          toast.success('Marks cleared successfully');
          fetchExamResults();
        }
        
        // Clear from editing inputs
        setEditingInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[`${studentId}-${examType}`];
          return newInputs;
        });
        return;
      }

      // Parse as float for decimal numbers
      const marksValue = parseFloat(marks);

      // Validate the parsed value
      if (isNaN(marksValue)) {
        toast.error('Please enter a valid number');
        return;
      }

      if (marksValue < 0) {
        toast.error('Marks cannot be negative');
        return;
      }

      if (marksValue > maxMarks[examType]) {
        toast.error(`Maximum marks for ${examType} is ${maxMarks[examType]}`);
        return;
      }

      const existingResult = examResults.find(result => 
        result.student._id === studentId && 
        result.subject === selectedSubject && 
        result.exam_type === examType
      );

      const resultData = {
        student: studentId,
        class: selectedClass,
        subject: selectedSubject,
        exam_type: examType,
        marks: marksValue
      };

      console.log('Sending data to backend:', resultData);

      let response;
      if (existingResult) {
        response = await teacherAPI.updateExamResult(existingResult._id, resultData);
        toast.success('Result updated successfully');
      } else {
        response = await teacherAPI.createExamResult(resultData);
        toast.success('Result saved successfully');
      }

      console.log('Backend response:', response.data);
      fetchExamResults();

      // Clear from editing inputs after successful save
      setEditingInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[`${studentId}-${examType}`];
        return newInputs;
      });

    } catch (error) {
      console.error('Save result error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to save result');
    }
  };

  const handleInputBlur = (studentId, examType, value) => {
    if (value !== '' && value !== null && value !== undefined) {
      handleSaveResult(studentId, selectedSubject, examType, value);
    } else {
      // Clear from editing inputs if empty
      setEditingInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[`${studentId}-${examType}`];
        return newInputs;
      });
    }
  };

  const handleInputKeyPress = (e, studentId, examType, value) => {
    if (e.key === 'Enter') {
      handleSaveResult(studentId, selectedSubject, examType, value);
    }
  };

  const getInputValue = (studentId, examType, existingResult) => {
    const editingKey = `${studentId}-${examType}`;
    if (editingInputs[editingKey] !== undefined) {
      return editingInputs[editingKey];
    }
    return existingResult?.marks !== undefined ? existingResult.marks : '';
  };

  const calculateTotal = (studentId, subject) => {
    const studentResults = examResults.filter(result => 
      result.student._id === studentId && 
      result.subject === subject &&
      result.marks !== undefined &&
      result.marks !== null
    );

    const total = studentResults.reduce((sum, result) => sum + result.marks, 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  const getGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-gradient-to-r from-green-500 to-green-400 text-white',
      'A': 'bg-gradient-to-r from-green-400 to-green-300 text-white',
      'B+': 'bg-gradient-to-r from-blue-500 to-blue-400 text-white',
      'B': 'bg-gradient-to-r from-blue-400 to-blue-300 text-white',
      'C': 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white',
      'D': 'bg-gradient-to-r from-orange-500 to-orange-400 text-white',
      'F': 'bg-gradient-to-r from-red-500 to-red-400 text-white'
    };
    return colors[grade] || 'bg-gray-100 text-gray-600';
  };

  const filteredStudents = students.filter(student =>
    student.Std_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Std_ID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExamTypeDisplay = (type) => {
    const displays = {
      monthly_one: 'Monthly I',
      midTerm: 'Mid Term',
      monthly_two: 'Monthly II',
      Final: 'Final Exam'
    };
    return displays[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center space-x-3">
              <Award className="w-7 h-7 text-blue-200" />
              <span>Exam Results Management</span>
            </h1>
            <p className="text-blue-200 opacity-90">Manage and track student exam performance</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="hidden md:flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-xl">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">{subjects.length} Subjects</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-blue-500 px-4 py-2 rounded-xl">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{classes.length} Classes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Select Class</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
            >
              <option value="">Choose Class</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Select Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Search Student</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Selected Filters Display */}
        {(selectedClass || selectedSubject) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedClass && (
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-semibold">
                Class: {selectedClass}
              </span>
            )}
            {selectedSubject && (
              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold">
                Subject: {selectedSubject}
              </span>
            )}
          </div>
        )}
      </div>

      {selectedClass && (
        <>
          {/* Results Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span>Student Results</span>
                </h2>
                <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                  <span className="text-sm text-gray-600 font-medium">
                    {filteredStudents.length} Students
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Student Info
                    </th>
                    {examTypes.map((type) => (
                      <th key={type} className="px-3 lg:px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] lg:text-xs">{getExamTypeDisplay(type)}</span>
                          <span className="text-[8px] lg:text-[10px] text-blue-200">
                            {type === 'monthly_one' || type === 'monthly_two' ? '/10' : 
                             type === 'midTerm' ? '/20' : '/60'}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Total /100
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-blue-50 transition-colors duration-200">
                      {/* Student Info */}
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {student.Std_Name}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            ID: {student.Std_ID}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.Gender}
                          </div>
                        </div>
                      </td>

                      {/* Exam Type Inputs */}
                      {examTypes.map((examType) => {
                        const existingResult = examResults.find(result => 
                          result.student._id === student._id && 
                          result.subject === selectedSubject && 
                          result.exam_type === examType
                        );

                        const inputValue = getInputValue(student._id, examType, existingResult);

                        return (
                          <td key={examType} className="px-3 lg:px-4 py-4">
                            <div className="flex justify-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={inputValue}
                                onChange={(e) => handleInputChange(student._id, examType, e.target.value)}
                                onBlur={(e) => handleInputBlur(student._id, examType, e.target.value)}
                                onKeyPress={(e) => handleInputKeyPress(e, student._id, examType, e.target.value)}
                                className="w-16 lg:w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
                                placeholder="0"
                                title="Enter marks (e.g., 7.5, 8.25). Press Enter to save."
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <span className={`px-3 py-2 rounded-lg font-bold text-sm ${
                            selectedSubject 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {selectedSubject ? calculateTotal(student._id, selectedSubject) : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Grade */}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        {selectedSubject ? (
                          <span className={`inline-flex items-center px-3 py-2 rounded-lg font-bold text-sm ${getGradeColor(getGrade(calculateTotal(student._id, selectedSubject)))}`}>
                            {getGrade(calculateTotal(student._id, selectedSubject))}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-500 font-bold text-sm">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Students Found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {selectedSubject && filteredStudents.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-400 rounded-2xl shadow-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">
                  {filteredStudents.filter(student => {
                    const total = calculateTotal(student._id, selectedSubject);
                    return getGrade(total) === 'A+' || getGrade(total) === 'A';
                  }).length}
                </div>
                <div className="text-green-100 text-sm font-medium">Excellent (A/A+)</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl shadow-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">
                  {filteredStudents.filter(student => {
                    const total = calculateTotal(student._id, selectedSubject);
                    return getGrade(total) === 'B+' || getGrade(total) === 'B';
                  }).length}
                </div>
                <div className="text-blue-100 text-sm font-medium">Good (B/B+)</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-2xl shadow-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">
                  {filteredStudents.filter(student => {
                    const total = calculateTotal(student._id, selectedSubject);
                    return getGrade(total) === 'C' || getGrade(total) === 'D';
                  }).length}
                </div>
                <div className="text-yellow-100 text-sm font-medium">Average (C/D)</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-400 rounded-2xl shadow-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">
                  {filteredStudents.filter(student => {
                    const total = calculateTotal(student._id, selectedSubject);
                    return getGrade(total) === 'F';
                  }).length}
                </div>
                <div className="text-red-100 text-sm font-medium">Needs Help (F)</div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedClass && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Class Selected</h3>
          <p className="text-gray-500">Please select a class to view and manage exam results</p>
        </div>
      )}
    </div>
  );
};

export default ExamResultsPage;