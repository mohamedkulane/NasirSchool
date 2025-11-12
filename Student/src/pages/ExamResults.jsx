import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentAPI } from '../services/api'
import Card, { CardContent, CardHeader } from '../components/UI/Card'
import Loading from '../components/UI/Loading'
import Button from '../components/UI/Button'
import { BookOpen, Download, Award, TrendingUp, BarChart3, Target, AlertCircle } from 'lucide-react'
import { getGrade, getGradeColor } from '../utils/helpers'

const ExamResults = () => {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedExamType, setSelectedExamType] = useState('all')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchExamResults()
  }, [])

  const fetchExamResults = async () => {
    try {
      console.log("🔄 Fetching REAL exam results...")
      const response = await studentAPI.getExamResults()
      console.log("📦 REAL API response:", response)
      
      if (response.success) {
        console.log("✅ REAL data received:", response.data)
        setResults(response.data || [])
      } else {
        setError(response.error || 'Failed to load exam results')
      }
    } catch (error) {
      console.error('❌ Failed to fetch REAL exam results:', error)
      setError('Error loading exam results: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ SAXO: Get max marks for each exam type
  const getMaxMarks = (examType) => {
    const maxMarksMap = {
      'monthly_one': 10,
      'midTerm': 20,
      'monthly_two': 10,
      'Final': 60
    }
    return maxMarksMap[examType] || 100
  }

  // ✅ SAXO: Calculate percentage with correct max marks
  const calculatePercentage = (marks, examType) => {
    const maxMarks = getMaxMarks(examType)
    return maxMarks > 0 ? (marks / maxMarks) * 100 : 0
  }

  // ✅ SAXO: Process results for specific exam type
  const processExamTypeData = (examType) => {
    const examResults = results.filter(result => result.exam_type === examType)
    const subjects = [...new Set(examResults.map(result => result.subject))]
    
    const tableData = subjects.map(subject => {
      const result = examResults.find(r => r.subject === subject)
      const marks = result?.marks || 0
      const maxMarks = getMaxMarks(examType)
      const percentage = calculatePercentage(marks, examType)
      
      return {
        subject,
        marks: marks,
        maxMarks: maxMarks,
        percentage: percentage,
        grade: getGrade(percentage),
        teacher: result?.teacher?.T_Name || 'N/A'
      }
    })

    // Sort by percentage for ranking
    tableData.sort((a, b) => b.percentage - a.percentage)
    
    // Add ranks
    tableData.forEach((row, index) => {
      row.rank = index + 1
    })

    return tableData
  }

  // ✅ SAXO: Process results for ALL exams (combined)
  const processAllExamsData = () => {
    const subjects = [...new Set(results.map(result => result.subject))]
    const examTypes = ['monthly_one', 'midTerm', 'monthly_two', 'Final']
    
    const subjectMap = {}
    
    subjects.forEach(subject => {
      subjectMap[subject] = {
        monthly_one: 0,
        midTerm: 0,
        monthly_two: 0,
        Final: 0,
        totalMarks: 0,
        totalMaxMarks: 0
      }
    })

    results.forEach(result => {
      if (subjectMap[result.subject]) {
        subjectMap[result.subject][result.exam_type] = result.marks
        subjectMap[result.subject].totalMarks += result.marks
        subjectMap[result.subject].totalMaxMarks += getMaxMarks(result.exam_type)
      }
    })

    const tableData = subjects.map(subject => {
      const subjectData = subjectMap[subject]
      const totalPercentage = subjectData.totalMaxMarks > 0 
        ? (subjectData.totalMarks / subjectData.totalMaxMarks) * 100 
        : 0
      
      return {
        subject,
        monthly_one: subjectData.monthly_one,
        midTerm: subjectData.midTerm,
        monthly_two: subjectData.monthly_two,
        Final: subjectData.Final,
        totalMarks: subjectData.totalMarks,
        totalMaxMarks: subjectData.totalMaxMarks,
        percentage: totalPercentage,
        grade: getGrade(totalPercentage)
      }
    })

    tableData.sort((a, b) => b.percentage - a.percentage)
    tableData.forEach((row, index) => { row.rank = index + 1 })
    
    return tableData
  }

  // ✅ SAXO: Get current table data based on selection
  const getCurrentTableData = () => {
    if (selectedExamType === 'all') {
      return processAllExamsData()
    } else {
      return processExamTypeData(selectedExamType)
    }
  }

  const currentTableData = getCurrentTableData()

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (currentTableData.length === 0) return null
    
    const totalPercentage = currentTableData.reduce((sum, row) => sum + row.percentage, 0)
    const averagePercentage = totalPercentage / currentTableData.length
    const highestPercentage = Math.max(...currentTableData.map(row => row.percentage))
    const passedSubjects = currentTableData.filter(row => row.percentage >= 40).length
    
    return {
      averagePercentage,
      highestPercentage,
      passedSubjects,
      totalSubjects: currentTableData.length
    }
  }

  const stats = calculateOverallStats()

  // ✅ SAXO: Exam type display names
  const getExamTypeDisplayName = (examType) => {
    const examTypeMap = {
      'all': 'All Exams',
      'monthly_one': 'Monthly Test 1',
      'midTerm': 'Mid Term',
      'monthly_two': 'Monthly Test 2', 
      'Final': 'Final Exam'
    }
    return examTypeMap[examType] || examType
  }

  // ✅ SAXO: Excel Export Function
  const handleExport = async () => {
    setExportLoading(true)
    try {
      // Dynamically import xlsx library
      const XLSX = await import('xlsx')
      
      let exportData = []
      let fileName = ''
      let sheetName = ''

      if (selectedExamType === 'all') {
        exportData = currentTableData.map(row => ({
          'Rank': row.rank,
          'Subject': row.subject.charAt(0).toUpperCase() + row.subject.slice(1),
          'Monthly One': row.monthly_one,
          'Mid Term': row.midTerm,
          'Monthly Two': row.monthly_two,
          'Final Exam': row.Final,
          'Total Marks': row.totalMarks,
          'Max Marks': row.totalMaxMarks,
          'Percentage': row.percentage.toFixed(1) + '%',
          'Grade': row.grade
        }))
        fileName = `all-exam-results-${user?.Std_ID || 'student'}`
        sheetName = 'All Exams Results'
      } else {
        exportData = currentTableData.map(row => ({
          'Rank': row.rank,
          'Subject': row.subject.charAt(0).toUpperCase() + row.subject.slice(1),
          'Marks': row.marks,
          'Max Marks': row.maxMarks,
          'Percentage': row.percentage.toFixed(1) + '%',
          'Grade': row.grade,
          'Teacher': row.teacher
        }))
        const examTypeName = getExamTypeDisplayName(selectedExamType).toLowerCase().replace(/\s+/g, '-')
        fileName = `${examTypeName}-results-${user?.Std_ID || 'student'}`
        sheetName = `${getExamTypeDisplayName(selectedExamType)} Results`
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Generate Excel file
      XLSX.writeFile(wb, `${fileName}.xlsx`)

    } catch (error) {
      console.error('❌ Export error:', error)
      // Fallback to CSV if Excel fails
      handleCSVExport()
    } finally {
      setExportLoading(false)
    }
  }

  // ✅ SAXO: CSV Fallback Export
  const handleCSVExport = () => {
    let exportData = []
    let fileName = ''

    if (selectedExamType === 'all') {
      exportData = currentTableData.map(row => ({
        'Rank': row.rank,
        'Subject': row.subject.charAt(0).toUpperCase() + row.subject.slice(1),
        'Monthly One': row.monthly_one,
        'Mid Term': row.midTerm,
        'Monthly Two': row.monthly_two,
        'Final Exam': row.Final,
        'Total Marks': row.totalMarks,
        'Max Marks': row.totalMaxMarks,
        'Percentage': row.percentage.toFixed(1) + '%',
        'Grade': row.grade
      }))
      fileName = `all-exam-results-${user?.Std_ID || 'student'}.csv`
    } else {
      exportData = currentTableData.map(row => ({
        'Rank': row.rank,
        'Subject': row.subject.charAt(0).toUpperCase() + row.subject.slice(1),
        'Marks': row.marks,
        'Max Marks': row.maxMarks,
        'Percentage': row.percentage.toFixed(1) + '%',
        'Grade': row.grade,
        'Teacher': row.teacher
      }))
      const examTypeName = getExamTypeDisplayName(selectedExamType).toLowerCase().replace(/\s+/g, '-')
      fileName = `${examTypeName}-results-${user?.Std_ID || 'student'}.csv`
    }
    
    const headers = Object.keys(exportData[0] || {}).join(',')
    const csv = [headers, ...exportData.map(row => Object.values(row).join(','))].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // ✅ SAXO: Render table based on exam type
  const renderTable = () => {
    if (selectedExamType === 'all') {
      return renderAllExamsTable()
    } else {
      return renderSingleExamTable()
    }
  }

  const renderAllExamsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Rank</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Subject</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Monthly One</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Mid Term</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Monthly Two</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Final Exam</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2] bg-[#ABE7B2]/30">Total</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2] bg-[#ABE7B2]/30">Percentage</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2] bg-[#ABE7B2]/30">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ABE7B2]/30">
          {currentTableData.map((row, index) => {
            const gradeInfo = getGradeColor(row.grade)
            return (
              <tr key={row.subject} className="hover:bg-[#ECF4E8]/50 transition-all duration-300 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                    row.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                    row.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md' :
                    row.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md' :
                    'bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] text-white group-hover:scale-110'
                  }`}>
                    {row.rank}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#93BFC7] to-[#ABE7B2] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#2A5C6B] capitalize">{row.subject}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-[#2A5C6B]">{row.monthly_one}</div>
                  <div className="text-xs text-[#3E7A6B]">/10</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-[#2A5C6B]">{row.midTerm}</div>
                  <div className="text-xs text-[#3E7A6B]">/20</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-[#2A5C6B]">{row.monthly_two}</div>
                  <div className="text-xs text-[#3E7A6B]">/10</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-[#2A5C6B]">{row.Final}</div>
                  <div className="text-xs text-[#3E7A6B]">/60</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-[#ECF4E8]/50">
                  <div className="text-sm font-bold text-[#2A5C6B]">{row.totalMarks}</div>
                  <div className="text-xs text-[#3E7A6B]">/100</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-[#ECF4E8]/50">
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    row.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                    row.percentage >= 60 ? 'bg-blue-100 text-blue-700' : 
                    row.percentage >= 40 ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.percentage.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-[#ECF4E8]/50">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gradeInfo.bg} ${gradeInfo.color} border border-white/50 shadow-sm`}>
                    {row.grade}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderSingleExamTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Rank</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Subject</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Marks</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Percentage</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Grade</th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Teacher</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ABE7B2]/30">
          {currentTableData.map((row, index) => {
            const gradeInfo = getGradeColor(row.grade)
            return (
              <tr key={row.subject} className="hover:bg-[#ECF4E8]/50 transition-all duration-300 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                    row.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                    row.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md' :
                    row.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md' :
                    'bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] text-white group-hover:scale-110'
                  }`}>
                    {row.rank}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#93BFC7] to-[#ABE7B2] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#2A5C6B] capitalize">{row.subject}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-lg font-bold text-[#2A5C6B]">{row.marks}</span>
                    <span className="text-sm text-[#3E7A6B]">/ {getMaxMarks(selectedExamType)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    row.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                    row.percentage >= 60 ? 'bg-blue-100 text-blue-700' : 
                    row.percentage >= 40 ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.percentage.toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gradeInfo.bg} ${gradeInfo.color} border border-white/50 shadow-sm`}>
                    {row.grade}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-[#3E7A6B] bg-[#ECF4E8] px-3 py-1 rounded-full border border-[#ABE7B2]">
                    {row.teacher}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93BFC7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3E7A6B] font-medium">Loading exam results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <Button 
            onClick={fetchExamResults}
            className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white border-0"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2A5C6B] to-[#3E7A6B] bg-clip-text text-transparent">
            Exam Results
          </h1>
          <p className="text-[#3E7A6B] mt-2">Track your academic performance and progress</p>
        </div>
        
        {currentTableData.length > 0 && (
          <Button 
            onClick={handleExport}
            disabled={exportLoading}
            className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting Excel...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" />
                Export {getExamTypeDisplayName(selectedExamType)} Results
              </>
            )}
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && currentTableData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E7A6B]">Average Score</p>
                  <p className="text-2xl font-bold text-[#2A5C6B] mt-1">{stats.averagePercentage.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[#93BFC7]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E7A6B]">Highest Score</p>
                  <p className="text-2xl font-bold text-[#2A5C6B] mt-1">{stats.highestPercentage.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[#93BFC7]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E7A6B]">Subjects Passed</p>
                  <p className="text-2xl font-bold text-[#2A5C6B] mt-1">
                    {stats.passedSubjects}/{stats.totalSubjects}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#93BFC7]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#3E7A6B]">Overall Rank</p>
                  <p className="text-2xl font-bold text-[#2A5C6B] mt-1">
                    #{currentTableData.find(row => row.subject === currentTableData[0]?.subject)?.rank || 1}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-[#93BFC7]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam Type Selection */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm ">
        <CardContent className="p-6 ">
          <div className="flex flex-wrap gap-3">
            {['all', 'monthly_one', 'midTerm', 'monthly_two', 'Final'].map(examType => (
              <button
                key={examType}
                onClick={() => setSelectedExamType(examType)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedExamType === examType
                    ? 'bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] text-white shadow-lg'
                    : 'bg-[#ECF4E8] text-[#3E7A6B] hover:bg-[#CBF3BB] border border-[#ABE7B2]'
                }`}
              >
                {getExamTypeDisplayName(examType)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {currentTableData.length > 0 ? (
        <Card className="border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2A5C6B]">
                    {getExamTypeDisplayName(selectedExamType)} Results
                  </h2>
                  <p className="text-sm text-[#3E7A6B]">
                    {currentTableData.length} subjects • Updated recently
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#3E7A6B]">Student ID</p>
                <p className="text-lg font-bold text-[#2A5C6B]">{user?.Std_ID}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable()}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-[#93BFC7]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2A5C6B] mb-3">No Results Available</h3>
            <p className="text-[#3E7A6B] max-w-md mx-auto">
              {results.length === 0 
                ? 'No exam results have been published yet. Please check back later.'
                : `No ${getExamTypeDisplayName(selectedExamType).toLowerCase()} results are available at the moment.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExamResults