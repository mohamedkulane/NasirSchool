// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // ✅ ADD TEACHER LOGIN STATUS CHECK
    if (decoded.role === 'teacher') {
      const teacher = await Teacher.findById(decoded.userId);
      
      if (!teacher) {
        return res.status(401).json({ 
          success: false, 
          error: 'Teacher account not found' 
        });
      }
      
      // ✅ CHECK IF LOGIN IS ALLOWED
      if (teacher.loginAllowed === false) {
        return res.status(403).json({ 
          success: false, 
          error: 'Your login has been blocked by admin. Please contact administrator.' 
        });
      }
      
      // ✅ CHECK TOKEN VERSION (IF IMPLEMENTED)
      if (teacher.tokenVersion && decoded.tokenVersion !== teacher.tokenVersion) {
        return res.status(401).json({ 
          success: false, 
          error: 'Session expired. Please login again.' 
        });
      }
      
      req.teacher = teacher;
    }
    
    // ✅ ADD STUDENT LOGIN STATUS CHECK (IF NEEDED)
    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.userId);
      
      if (!student) {
        return res.status(401).json({ 
          success: false, 
          error: 'Student account not found' 
        });
      }
      
      // ✅ CHECK STUDENT LOGIN STATUS
      if (student.loginAllowed === false) {
        return res.status(403).json({ 
          success: false, 
          error: 'Your login has been blocked. Please contact administrator.' 
        });
      }
      
      req.student = student;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired. Please login again.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
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
      if (student && student.loginAllowed !== false) {
        req.userDetails = student;
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(req.user.userId);
      if (teacher && teacher.loginAllowed !== false) {
        req.userDetails = teacher;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// ✅ NEW: TEACHER-ONLY AUTHENTICATION MIDDLEWARE
exports.authenticateTeacher = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // ✅ MUST BE TEACHER
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Teacher access only.' 
      });
    }
    
    const teacher = await Teacher.findById(decoded.userId);
    
    if (!teacher) {
      return res.status(401).json({ 
        success: false, 
        error: 'Teacher account not found' 
      });
    }
    
    // ✅ STRICT CHECK: MUST BE TRUE TO ACCESS
    if (teacher.loginAllowed !== true) {
      // ✅ LOG THE ATTEMPT
      console.log(`Blocked teacher login attempt: ${teacher.T_Name} (${teacher.User_Name})`);
      
      return res.status(403).json({ 
        success: false, 
        error: 'Your login has been suspended. Please contact the administrator.' 
      });
    }
    
    // ✅ CHECK TOKEN VERSION (IF AVAILABLE)
    if (teacher.tokenVersion && decoded.tokenVersion !== teacher.tokenVersion) {
      return res.status(401).json({ 
        success: false, 
        error: 'Your session has been terminated. Please login again.' 
      });
    }
    
    req.user = decoded;
    req.teacher = teacher;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token. Please login again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.' 
      });
    }
    
    console.error('Teacher auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};