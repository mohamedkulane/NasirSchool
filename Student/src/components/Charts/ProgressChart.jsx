import React from 'react'

const ProgressChart = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for chart
      </div>
    )
  }

  // Simple bar chart without recharts
  const maxScore = Math.max(...data.map(item => item.score))
  
  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => {
          const barHeight = (item.score / maxScore) * 80
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                style={{ height: `${barHeight}%` }}
              ></div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {item.name}
              </div>
              <div className="text-sm font-semibold text-gray-900 mt-1">
                {item.score}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressChart