const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// ✅ KU DAR LOGIN ENDPOINT (UPDATED WITH loginAllowed CHECK)
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Raadi ardayga
    const student = await Student.findOne({ Std_ID: studentId });
    
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        error: 'Student ID ama password khalad' 
      });
    }

    // ✅ HADII LOGIN ALLOWED KA YAHOO FALSE
    if (!student.loginAllowed) {
      return res.status(401).json({ 
        success: false, 
        error: 'Adminka ma fasaxin inaad login-gasho. Fadlan la xiriir maamulka.' 
      });
    }

    // Hubi in ardaygu active yahay
    if (student.Status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        error: 'Akoonkani ma shaqaynayo. La xiriir maamulka.' 
      });
    }

    // Hubi password-ka
    if (student.Std_Password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Student ID ama password khalad' 
      });
    }

    // Samee token
    const token = jwt.sign(
      { 
        studentId: student.Std_ID,
        id: student._id,
        loginAllowed: student.loginAllowed
      },
      process.env.JWT_SECRET || 'student-secret-key-kaaga',
      { expiresIn: '7d' }
    );

    // Ha u dirin password
    const studentData = student.toObject();
    delete studentData.Std_Password;

    res.json({
      success: true,
      data: {
        student: studentData,
        token
      }
    });

  } catch (error) {
    console.error('Qalad login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Qalad serverka' 
    });
  }
});

// ✅ KU DAR TOKEN VERIFICATION MIDDLEWARE (UPDATED VERSION)
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token ma la gelin' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'student-secret-key-kaaga');
    
    // ✅ KU DAR: Raadi ardayga database-ka si aad u hubiso loginAllowed-ka
    const student = await Student.findById(decoded.id);
    
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    // ✅ KU DAR: Hubi in ardaygu loginAllowed yahay
    if (!student.loginAllowed) {
      return res.status(401).json({ 
        success: false, 
        error: 'Login-kaaga waa la joojiyay. Fadlan la xiriir maamulka.' 
      });
    }

    // ✅ KU DAR: Hubi in ardaygu active yahay
    if (student.Status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        error: 'Akoonkani ma shaqaynayo. La xiriir maamulka.' 
      });
    }

    // Ku dar macluumaadka ardayga request-ka
    req.student = {
      ...decoded,
      loginAllowed: student.loginAllowed,
      Status: student.Status
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Token khalad ama waqtigiisa dhamaday' 
    });
  }
};

// ✅ KU DAR TOKEN VERIFICATION ENDPOINT
router.get('/verify-token', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        studentId: req.student.studentId,
        loginAllowed: req.student.loginAllowed,
        Status: req.student.Status
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token verification failed'
    });
  }
});

// ✅ KU DAR LOGOUT ENDPOINT
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Halkan waxaad ku dari kartaa token invalidation logic
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Logout error' 
    });
  }
});



// Get student's exam results
router.get('/exam-results', verifyToken, async (req, res) => {
  try {
    const studentId = req.student.id; // Hada token-ka ka hel studentId
    
    const results = await ExamResult.find({ student: studentId })
      .populate('teacher', 'T_Name')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get student profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const studentId = req.student.id; // Token-ka ka hel
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    // Don't send password
    const { Std_Password, ...studentData } = student.toObject();
    
    res.json({ 
      success: true, 
      data: studentData 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Change student password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const studentId = req.student.id; // Token-ka ka hel
    const { currentPassword, newPassword } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    if (student.Std_Password !== currentPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }
    
    student.Std_Password = newPassword;
    await student.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get student's attendance
router.get('/attendance', verifyToken, async (req, res) => {
  try {
    const studentId = req.student.id; // Token-ka ka hel
    const { startDate, endDate } = req.query;
    
    let filter = { student: studentId };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(filter)
      .populate('teacher', 'T_Name')
      .sort({ date: -1 });
    
    res.json({ 
      success: true, 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Student dashboard
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const studentId = req.student.id; // Token-ka ka hel
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    // Get recent results
    const recentResults = await ExamResult.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get attendance summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: studentId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const presentCount = attendanceStats.find(stat => stat._id === 'present')?.count || 0;
    const absentCount = attendanceStats.find(stat => stat._id === 'absent')?.count || 0;
    
    res.json({
      success: true,
      data: {
        student: {
          name: student.Std_Name,
          class: student.Class,
          shift: student.Shift
        },
        recentResults,
        attendance: {
          present: presentCount,
          absent: absentCount,
          percentage: presentCount + absentCount > 0 ? 
            Math.round((presentCount / (presentCount + absentCount)) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;