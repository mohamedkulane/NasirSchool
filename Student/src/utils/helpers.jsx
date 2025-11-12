import { GRADING_SYSTEM } from './constants'

export const getGrade = (percentage) => {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

export const getGradeColor = (grade) => {
  return GRADING_SYSTEM[grade] || GRADING_SYSTEM.F
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculateAverage = (marks) => {
  if (!marks || Object.keys(marks).length === 0) return 0
  const values = Object.values(marks).map(Number)
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round(sum / values.length)
}

export const exportToExcel = (data, filename) => {
  // Simple CSV export for now
  const headers = Object.keys(data[0]).join(',')
  const csv = [headers, ...data.map(row => Object.values(row).join(','))].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}