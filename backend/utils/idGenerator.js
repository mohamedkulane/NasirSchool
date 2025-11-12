const Student = require('../models/Student');

const generateStudentID = async () => {
  try {
    const lastStudent = await Student.findOne().sort({ Std_ID: -1 });
    
    if (!lastStudent) {
      return 'N001';
    }
    
    const lastNumber = parseInt(lastStudent.Std_ID.substring(1));
    const newNumber = lastNumber + 1;
    return `N${newNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    // Fallback if there's an error
    return `N${Date.now().toString().slice(-3)}`;
  }
};

module.exports = { generateStudentID };