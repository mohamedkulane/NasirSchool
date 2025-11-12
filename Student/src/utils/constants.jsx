export const CLASSES = {
  PRIMARY: [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 'class 8T'
  ],
  SECONDARY: [
    'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 'Form 3A', 'Form 4A'
  ]
}

export const SUBJECTS = {
  PRIMARY: [
    'math', 'english', 'somali', 'islamic', 'arabic', 
    'science', 'cilmi_bulsho', 'technology'
  ],
  SECONDARY: [
    'math', 'physics', 'biology', 'chemistry', 'somali', 
    'islamic', 'arabic', 'business', 'english', 'tariikh', 
    'geography', 'technology'
  ]
}

export const EXAM_TYPES = [
  'monthly_one',
  'midTerm', 
  'monthly_two',
  'Final'
]


export const GRADING_SYSTEM = {
  A: { min: 90, color: 'text-success-600', bg: 'bg-success-50' },
  B: { min: 80, color: 'text-primary-600', bg: 'bg-primary-50' },
  C: { min: 70, color: 'text-warning-600', bg: 'bg-warning-50' },
  D: { min: 60, color: 'text-orange-600', bg: 'bg-orange-50' },
  F: { min: 0, color: 'text-danger-600', bg: 'bg-danger-50' }
}