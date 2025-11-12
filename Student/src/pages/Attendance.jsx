import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentAPI } from '../services/api'
import Card, { CardContent, CardHeader } from '../components/UI/Card'
import Loading from '../components/UI/Loading'
import Button from '../components/UI/Button'
import { Calendar, Check, X, Download, Filter, TrendingUp, Clock, UserCheck, AlertCircle } from 'lucide-react'
import { formatDate } from '../utils/helpers'

const Attendance = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  })

  useEffect(() => {
    fetchAttendance()
  }, [filters.startDate, filters.endDate])

  const fetchAttendance = async () => {
    try {
      const params = {}
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate
        params.endDate = filters.endDate
      }

      const response = await studentAPI.getAttendance(params)
      if (response.success) {
        setAttendance(response.data)
      } else {
        setError('Failed to load attendance records')
      }
    } catch (error) {
      setError('Error loading attendance records')
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttendance = attendance.filter(record => {
    if (filters.status && record.status !== filters.status) {
      return false
    }
    return true
  })

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    total: attendance.length,
    percentage: attendance.length > 0 
      ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
      : 0
  }

  const handleExport = () => {
    const exportData = filteredAttendance.map(record => ({
      Date: formatDate(record.date),
      Status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      'Teacher': record.teacher?.T_Name || 'N/A',
      'Class': user?.Class || 'N/A',
      'Shift': user?.Shift || 'N/A'
    }))
    
    const headers = Object.keys(exportData[0] || {}).join(',')
    const csv = [headers, ...exportData.map(row => Object.values(row).join(','))].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-${user?.Std_ID || 'student'}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93BFC7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3E7A6B] font-medium">Loading attendance records...</p>
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
            onClick={fetchAttendance}
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
            Attendance
          </h1>
          <p className="text-[#3E7A6B] mt-2">Track your attendance records and statistics</p>
        </div>
        
        {filteredAttendance.length > 0 && (
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download size={18} className="mr-2" />
            Export Records
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3E7A6B]">Total Days</p>
                <p className="text-2xl font-bold text-[#2A5C6B] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#93BFC7]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3E7A6B]">Present</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.present}</p>
              </div>
              <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3E7A6B]">Absent</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
              </div>
              <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                <X className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3E7A6B]">Attendance Rate</p>
                <p className="text-2xl font-bold text-[#93BFC7] mt-1">{stats.percentage}%</p>
              </div>
              <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#93BFC7]" />
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#2A5C6B]">Filter Records</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3E7A6B] mb-3">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-[#ABE7B2] rounded-xl focus:ring-2 focus:ring-[#93BFC7] focus:border-[#93BFC7] bg-white/50 transition-all duration-300"
              >
                <option value="" className="text-[#3E7A6B]">All Status</option>
                <option value="present" className="text-[#3E7A6B]">Present</option>
                <option value="absent" className="text-[#3E7A6B]">Absent</option>
              </select>
            </div>
          </div>
          
          {(filters.startDate || filters.endDate || filters.status) && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setFilters({ startDate: '', endDate: '', status: '' })}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white border-0"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      {filteredAttendance.length > 0 ? (
        <Card className="border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB] border-b border-[#ABE7B2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#93BFC7] to-[#ABE7B2] rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2A5C6B]">Attendance Records</h2>
                  <p className="text-sm text-[#3E7A6B]">
                    {filteredAttendance.length} records • {filters.startDate && filters.endDate ? 'Filtered' : 'All time'}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#ECF4E8] to-[#CBF3BB]">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Teacher</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Class</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#2A5C6B] uppercase tracking-wider border-b border-[#ABE7B2]">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ABE7B2]/30">
                  {filteredAttendance.map((record, index) => (
                    <tr key={index} className="hover:bg-[#ECF4E8]/50 transition-all duration-300 group">
                      <td className="py-4 px-6 text-sm font-semibold text-[#2A5C6B] group-hover:text-[#93BFC7] transition-colors">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200 group-hover:scale-105'
                            : 'bg-red-100 text-red-700 border border-red-200 group-hover:bg-red-200 group-hover:scale-105'
                        }`}>
                          {record.status === 'present' ? (
                            <Check size={14} className="mr-1.5" />
                          ) : (
                            <X size={14} className="mr-1.5" />
                          )}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#3E7A6B] bg-white/30 rounded-xl mx-2">
                        {record.teacher?.T_Name || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-[#2A5C6B]">
                        {user?.Class || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-[#3E7A6B] capitalize bg-[#ECF4E8] px-3 py-1 rounded-full border border-[#ABE7B2]">
                        {user?.Shift || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-[#93BFC7]" />
            </div>
            <h3 className="text-2xl font-bold text-[#2A5C6B] mb-3">No Records Available</h3>
            <p className="text-[#3E7A6B] max-w-md mx-auto">
              {attendance.length === 0 
                ? 'No attendance records have been logged yet. Please check back later.'
                : 'No records match your current filters. Try adjusting your filter criteria.'
              }
            </p>
            {attendance.length > 0 && (
              <Button
                onClick={() => setFilters({ startDate: '', endDate: '', status: '' })}
                className="mt-6 bg-gradient-to-r from-[#93BFC7] to-[#ABE7B2] hover:from-[#7BAFB7] hover:to-[#95D5A2] text-white border-0"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Attendance