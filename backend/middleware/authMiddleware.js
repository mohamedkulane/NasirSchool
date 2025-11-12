const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Optional: Get user details middleware
exports.getUserDetails = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findById(req.user.userId);
      req.userDetails = student;
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(req.user.userId);
      req.userDetails = teacher;
    }
    next();
  } catch (error) {
    next(error);
  }
};