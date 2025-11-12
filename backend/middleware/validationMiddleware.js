exports.validateStudent = (req, res, next) => {
  const { Std_Name, parent_Name, parent_phone, Gender, Class, Shift } = req.body;
  
  if (!Std_Name || !parent_Name || !parent_phone || !Gender || !Class || !Shift) {
    return res.status(400).json({ 
      success: false, 
      error: 'All required fields must be provided' 
    });
  }

  const validGenders = ['Male', 'Female'];
  const validShifts = ['morning', 'afternoon'];
  const validClasses = [
    'class 1B', 'class 1T', 'class 1J', 'class 2B', 'class 2T', 
    'class 3B', 'class 3T', 'class 4B', 'class 4T', 'class 5B', 
    'class 5T', 'class 6B', 'class 7B', 'class 7T', 'class 8B', 
    'class 8T', 'Form 1A', 'Form 1B', 'Form 2A', 'Form 2B', 
    'Form 3A', 'Form 4A'
  ];

  if (!validGenders.includes(Gender)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid gender' 
    });
  }

  if (!validShifts.includes(Shift)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid shift' 
    });
  }

  if (!validClasses.includes(Class)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid class' 
    });
  }

  next();
};

exports.validateTeacher = (req, res, next) => {
  const { T_Name, T_subject, T_Number, T_class, User_Name, password } = req.body;
  
  if (!T_Name || !T_subject || !T_Number || !T_class || !User_Name || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'All teacher fields are required' 
    });
  }

  if (password.length < 4) {
    return res.status(400).json({ 
      success: false, 
      error: 'Password must be at least 4 characters long' 
    });
  }

  next();
};

exports.validateExamResult = (req, res, next) => {
  const { student, class: className, subject, exam_type, marks } = req.body;
  
  if (!student || !className || !subject || !exam_type || marks === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: 'All exam result fields are required' 
    });
  }

  const validExamTypes = ['monthly_one', 'midTerm', 'monthly_two', 'Final'];
  if (!validExamTypes.includes(exam_type)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid exam type' 
    });
  }

  const maxValues = {
    'monthly_one': 10,
    'midTerm': 20,
    'monthly_two': 10,
    'Final': 60
  };

  if (marks < 0 || marks > maxValues[exam_type]) {
    return res.status(400).json({ 
      success: false, 
      error: `Marks for ${exam_type} must be between 0 and ${maxValues[exam_type]}` 
    });
  }

  next();
};