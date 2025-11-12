import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentAPI } from '../services/api'
import Card, { CardContent, CardHeader } from '../components/UI/Card'
import Loading from '../components/UI/Loading'
import ProgressChart from '../components/Charts/ProgressChart'
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  BookOpen,
  Users,
  BarChart3,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log("🔄 Fetching REAL dashboard data...")
      const response = await studentAPI.getDashboard()
      console.log("📦 REAL Dashboard response:", response)
      
      if (response.success) {
        console.log("✅ REAL dashboard data received:", response.data)
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load dashboard data')
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error)
      setError('Error loading dashboard data: ' + error.message)
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
  const calculatePercentage = (result) => {
    const examType = result.exam_type || result.examType
    const marks = result.marks || result.totalMarks || 0
    const maxMarks = getMaxMarks(examType)
    
    return maxMarks > 0 ? (marks / maxMarks) * 100 : 0
  }

  // ✅ SAXO: Calculate real progress data from exam results
  const calculateProgressData = () => {
    if (!dashboardData?.recentResults) return []
    
    // Group results by term and calculate average percentage
    const termAverages = {}
    
    dashboardData.recentResults.forEach(result => {
      const term = result.term || 'Current Term'
      const percentage = calculatePercentage(result)
      
      if (!termAverages[term]) {
        termAverages[term] = {
          total: 0,
          count: 0
        }
      }
      termAverages[term].total += percentage
      termAverages[term].count += 1
    })
    
    // Convert to chart data format
    return Object.entries(termAverages).map(([term, data]) => ({
      name: term,
      score: Math.round(data.total / data.count)
    })).slice(0, 4) // Last 4 terms
  }

  const stats = [
 
    {
      title: 'Exam Results',
      value: dashboardData?.recentResults?.length || 0,
      icon: Award,
      color: 'text-[#ABE7B2]',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Available results'
    },
    {
      title: 'Average Score',
      value: dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? 
        `${Math.round(dashboardData.recentResults.reduce((sum, result) => 
          sum + calculatePercentage(result), 0) / dashboardData.recentResults.length
        )}%` : '0%',
      icon: BarChart3,
      color: 'text-[#3E7A6B]',
      bgColor: 'bg-[#ECF4E8]',
      borderColor: 'border-[#ABE7B2]',
      description: 'Overall performance'
    }
  ]

  const progressData = calculateProgressData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93BFC7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3E7A6B] font-medium">Loading dashboard...</p>
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
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] text-white rounded-xl hover:from-[#7BAFB7] hover:to-[#95D5A2] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2A5C6B] to-[#3E7A6B] bg-clip-text text-transparent">
          Welcome back, {user?.Std_Name}!
        </h1>
        <p className="text-[#3E7A6B] mt-2 text-lg">
          Here's your academic overview for <span className="font-semibold text-[#2A5C6B]">{user?.Class}</span>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl ${stat.bgColor} border ${stat.borderColor} transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-[#3E7A6B]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#2A5C6B] mt-1">{stat.value}</p>
                  <p className="text-xs text-[#93BFC7] mt-1 font-medium">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Progress Chart */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2A5C6B]">Academic Progress</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {progressData.length > 0 ? (
              <div className="relative">
                <ProgressChart data={progressData} height={300} />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#ABE7B2]">
                  <p className="text-xs font-semibold text-[#3E7A6B]">Trend Analysis</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-[#93BFC7]" />
                </div>
                <h3 className="text-lg font-bold text-[#2A5C6B] mb-2">No Progress Data</h3>
                <p className="text-[#3E7A6B]">Complete your first exam to see progress analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Exam Results */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2A5C6B]">Recent Exam Results</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentResults.slice(0, 5).map((result, index) => {
                  const subject = result.subject
                  const examType = result.exam_type || result.examType
                  const marks = result.marks || result.totalMarks || 0
                  const maxMarks = getMaxMarks(examType)
                  const percentage = calculatePercentage(result)
                  
                  return (
                    <div 
                      key={result._id || index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] rounded-xl border border-[#ABE7B2] hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#ABE7B2] group-hover:scale-110 transition-transform">
                          <BookOpen className="h-5 w-5 text-[#93BFC7]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2A5C6B] capitalize">{subject}</h3>
                          <p className="text-sm text-[#3E7A6B]">
                            {examType} • {result.term || 'Current Term'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#2A5C6B]">
                          {percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-[#3E7A6B]">
                          {marks}/{maxMarks}
                        </p>
                        <p className="text-xs font-medium text-[#93BFC7] mt-1">
                          {result.grade || 'Grade Pending'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-[#93BFC7]" />
                </div>
                <h3 className="text-lg font-bold text-[#2A5C6B] mb-2">No Exam Results</h3>
                <p className="text-[#3E7A6B]">Your exam results will appear here once available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview Section */}
      {dashboardData && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#2A5C6B]">Quick Overview</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-2xl border border-[#ABE7B2] hover:shadow-lg transition-all duration-300">
                <Users className="h-10 w-10 text-[#93BFC7] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#3E7A6B]">Class</p>
                <p className="text-xl font-bold text-[#2A5C6B] mt-2">{user?.Class || 'N/A'}</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-2xl border border-[#ABE7B2] hover:shadow-lg transition-all duration-300">
                <BookOpen className="h-10 w-10 text-[#93BFC7] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#3E7A6B]">Subjects</p>
                <p className="text-xl font-bold text-[#2A5C6B] mt-2">
                  {dashboardData.recentResults ? 
                    new Set(dashboardData.recentResults.map(r => r.subject)).size : 0
                  }
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-2xl border border-[#ABE7B2] hover:shadow-lg transition-all duration-300">
                <Award className="h-10 w-10 text-[#93BFC7] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#3E7A6B]">Best Subject</p>
                <p className="text-xl font-bold text-[#2A5C6B] mt-2 capitalize">
                  {dashboardData.recentResults && dashboardData.recentResults.length > 0 ? 
                    dashboardData.recentResults.reduce((best, current) => 
                      calculatePercentage(current) > calculatePercentage(best) ? current : best
                    ).subject : 'N/A'
                  }
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] rounded-2xl border border-[#ABE7B2] hover:shadow-lg transition-all duration-300">
                <Clock className="h-10 w-10 text-[#93BFC7] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#3E7A6B]">Study Streak</p>
                <p className="text-xl font-bold text-[#2A5C6B] mt-2">
                  {dashboardData.studyStreak || '0'} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam Scoring System */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
        <CardHeader className="border-b border-[#ABE7B2]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2A5C6B]">Exam Scoring System</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Monthly One', marks: '10/100', color: 'from-blue-100 to-blue-200' },
              { name: 'Mid Term', marks: '20/100', color: 'from-green-100 to-green-200' },
              { name: 'Monthly Two', marks: '10/100', color: 'from-purple-100 to-purple-200' },
              { name: 'Final Exam', marks: '60/100', color: 'from-orange-100 to-orange-200' }
            ].map((exam, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-2xl border border-[#ABE7B2] hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${exam.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Award className="h-6 w-6 text-[#2A5C6B]" />
                </div>
                <p className="text-sm font-semibold text-[#3E7A6B]">{exam.name}</p>
                <p className="text-lg font-bold text-[#2A5C6B] mt-2">{exam.marks}</p>
                <p className="text-xs text-[#93BFC7] font-medium mt-1">Max Marks</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard