import React from 'react'

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizes[size]}`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export default Loading