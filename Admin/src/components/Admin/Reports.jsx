// src/components/Admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, Award, BarChart3, BookOpen, Calendar } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Reports = () => {
  const [topStudents, setTopStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [examStats, setExamStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [
        attendanceResponse,
        examResultsResponse
      ] = await Promise.all([
        adminAPI.getAttendance(),
        adminAPI.getExamResults()
      ]);

      processTopStudents(examResultsResponse.data.data || []);
      processAttendanceStats(attendanceResponse.data.data || []);
      processExamStats(examResultsResponse.data.data || []);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTopStudents = (examResults) => {
    const studentAverages = examResults.reduce((acc, result) => {
      const studentId = result.student?._id;
      if (!studentId) return acc;

      if (!acc[studentId]) {
        acc[studentId] = {
          student: result.student,
          totalMarks: 0,
          count: 0
        };
      }

      acc[studentId].totalMarks += result.marks;
      acc[studentId].count += 1;

      return acc;
    }, {});

    const studentsWithAverages = Object.values(studentAverages)
      .map(item => ({
        ...item.student,
        average: item.count > 0 ? Math.round((item.totalMarks / item.count)) : 0
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);

    setTopStudents(studentsWithAverages);
  };

  const processAttendanceStats = (attendanceData) => {
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const total = attendanceData.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setAttendanceStats({
      present,
      absent,
      total,
      percentage
    });
  };

  const processExamStats = (examResults) => {
    const totalMarks = examResults.reduce((sum, result) => sum + result.marks, 0);
    const averageScore = examResults.length > 0 ? Math.round(totalMarks / examResults.length) : 0;
    const subjectCount = new Set(examResults.map(r => r.subject)).size;

    setExamStats({
      totalExams: examResults.length,
      averageScore,
      subjectCount
    });
  };

  const exportReport = async (type) => {
    try {
      let response;
      
      switch (type) {
        case 'results':
          response = await adminAPI.exportExamResults();
          break;
        case 'attendance':
          response = await adminAPI.exportAttendance();
          break;
        default:
          return;
      }

      if (response) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully!`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Export failed: ${errorMessage}`);
    }
  };

  const statCards = [
    {
      title: 'Top Students',
      value: topStudents.length,
      icon: Award,
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]',
      description: 'High performers'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceStats.percentage || 0}%`,
      icon: Users,
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90',
      description: 'Overall attendance'
    },
    {
      title: 'Total Exams',
      value: examStats.totalExams || 0,
      icon: BookOpen,
      color: 'bg-gradient-to-r from-[#FF9A00] to-[#FFD93D]',
      description: 'Conducted exams'
    },
    {
      title: 'Average Score',
      value: examStats.averageScore || 0,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90',
      description: 'Exam performance'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9A00] mx-auto mb-3"></div>
          <p className="text-[#4F200D]">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-[#FFD93D] text-sm sm:text-base">School performance overview</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => exportReport('results')}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/30"
            >
              <Download className="h-4 w-4" />
              <span className="hidden xs:inline">Export Results</span>
              <span className="xs:hidden">Results</span>
            </button>
            <button
              onClick={() => exportReport('attendance')}
              className="flex items-center justify-center gap-2 bg-[#FFD93D] hover:bg-[#FF9A00] text-[#4F200D] px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              <span className="hidden xs:inline">Export Attendance</span>
              <span className="xs:hidden">Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-[#FF9A00]/20 p-3 sm:p-4 hover:border-[#FF9A00]/40 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#4F200D]/70 mb-1 truncate">{card.title}</p>
                  <p className="text-lg sm:text-xl font-bold text-[#4F200D] truncate">
                    {card.value}
                  </p>
                  <p className="text-xs text-[#4F200D]/60 mt-1 truncate">{card.description}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.color} shadow-md flex-shrink-0 ml-2`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Performing Students */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#FF9A00]/20 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-[#4F200D] flex items-center">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#4F200D]" />
              Top Students
            </h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {topStudents.length > 0 ? (
              topStudents.map((student, index) => (
                <div key={student._id || index} className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/50 rounded-lg border border-[#FF9A00]/20 hover:from-[#FFD93D]/20 hover:to-[#FF9A00]/20 transition-all duration-300">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#4F200D] text-xs sm:text-sm font-bold border flex-shrink-0 ${
                      index === 0 ? 'bg-gradient-to-r from-[#FFD93D] to-[#FF9A00] border-[#FF9A00]' :
                      index === 1 ? 'bg-gradient-to-r from-[#F6F1E9] to-[#FFD93D]/50 border-[#FF9A00]/30' :
                      index === 2 ? 'bg-gradient-to-r from-[#FF9A00]/20 to-[#FFD93D]/20 border-[#FF9A00]/30' : 
                      'bg-[#F6F1E9] border-[#FF9A00]/20'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#4F200D] text-sm sm:text-base truncate">
                        {student.Std_Name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-[#4F200D]/70 truncate">{student.Class} • {student.Std_ID}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-[#4F200D]">
                      {student.average}%
                    </p>
                    <p className="text-xs text-[#4F200D]/60 hidden xs:block">Average</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-[#4F200D]/40 mx-auto mb-2" />
                <p className="text-[#4F200D]/60 text-sm sm:text-base">No exam results available</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#FF9A00]/20 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-[#4F200D]">Performance Overview</h3>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#4F200D]/60" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 rounded-lg sm:rounded-xl border border-[#FF9A00]/30">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#4F200D] mx-auto mb-2" />
              <div className="text-base sm:text-lg font-bold text-[#4F200D]">{examStats.averageScore || 0}</div>
              <div className="text-xs text-[#4F200D]/70">Average Score</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 rounded-lg sm:rounded-xl border border-[#4F200D]/20">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#4F200D] mx-auto mb-2" />
              <div className="text-base sm:text-lg font-bold text-[#4F200D]">{attendanceStats.percentage || 0}%</div>
              <div className="text-xs text-[#4F200D]/70">Attendance Rate</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-[#FFD93D]/10 to-[#FF9A00]/10 rounded-lg sm:rounded-xl border border-[#FF9A00]/30">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#4F200D] mx-auto mb-2" />
              <div className="text-base sm:text-lg font-bold text-[#4F200D]">
                {examStats.subjectCount || 0}
              </div>
              <div className="text-xs text-[#4F200D]/70">Subjects</div>
            </div>

            <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 rounded-lg sm:rounded-xl border border-[#4F200D]/20">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-[#4F200D] mx-auto mb-2" />
              <div className="text-base sm:text-lg font-bold text-[#4F200D]">
                {examStats.totalExams || 0}
              </div>
              <div className="text-xs text-[#4F200D]/70">Total Exams</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-[#FF9A00]/20 p-4 sm:p-5 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-[#4F200D] mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 rounded-lg border border-[#FF9A00]/30">
            <div className="text-base sm:text-lg font-bold text-[#4F200D]">{attendanceStats.present || 0}</div>
            <div className="text-xs text-[#4F200D]">Present</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 rounded-lg border border-[#4F200D]/20">
            <div className="text-base sm:text-lg font-bold text-[#4F200D]">{attendanceStats.absent || 0}</div>
            <div className="text-xs text-[#4F200D]">Absent</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-[#F6F1E9] to-[#F6F1E9]/80 rounded-lg border border-[#FF9A00]/20">
            <div className="text-base sm:text-lg font-bold text-[#4F200D]">{attendanceStats.total || 0}</div>
            <div className="text-xs text-[#4F200D]">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;