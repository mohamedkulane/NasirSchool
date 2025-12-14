const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// ✅ Teacher Login (UPDATED VERSION WITH loginAllowed CHECK)
router.post('/teacher/login', async (req, res) => {
  try {
    const { User_Name, password } = req.body;

    console.log('Login attempt for:', User_Name);

    if (!User_Name || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    const teacher = await Teacher.findOne({ User_Name });
    if (!teacher) {
      console.log('Teacher not found:', User_Name);
      return res.status(401).json({ 
        success: false, 
        error: 'Username ma saxn' 
      });
    }

    // ✅ KU DAR CHECK-GA LOGIN ALLOWED
    if (teacher.loginAllowed === false) {
      console.log('Login blocked for:', User_Name, 'loginAllowed:', teacher.loginAllowed);
      return res.status(403).json({ 
        success: false, 
        error: 'Login-kaaga waa la joojiyay. Fadlan la xiriir maamulaha.' 
      });
    }

    console.log('Teacher found:', teacher.T_Name, 'loginAllowed:', teacher.loginAllowed);

    if (teacher.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Password khalad ah' 
      });
    }

    // ✅ KU DAR UPDATE LAST LOGIN
    teacher.lastLogin = new Date();
    await teacher.save();

    const token = generateToken(teacher._id, 'teacher');

    res.json({
      success: true,
      token,
      user: {
        id: teacher._id,
        name: teacher.T_Name,
        userName: teacher.User_Name,
        role: 'teacher',
        classes: teacher.T_class,
        subjects: teacher.T_subject,
        loginAllowed: teacher.loginAllowed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { Std_ID, Std_Password } = req.body;

    const student = await Student.findOne({ Std_ID, Status: 'active' });
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials or inactive account' 
      });
    }

    if (student.Std_Password !== Std_Password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    const token = generateToken(student._id, 'student');

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.Std_Name,
        role: 'student',
        class: student.Class
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Admin Login
router.post('/login/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Admin login attempt:', username);

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid admin credentials' 
      });
    }

    const token = generateToken('admin_id', 'admin');

    res.json({
      success: true,
      token,
      user: {
        id: 'admin_id',
        name: 'Administrator',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Change Password
router.put('/change-password', async (req, res) => {
  try {
    const { userId, role, currentPassword, newPassword } = req.body;

    let user;
    if (role === 'teacher') {
      user = await Teacher.findById(userId);
    } else if (role === 'student') {
      user = await Student.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check current password
    const passwordField = role === 'teacher' ? 'password' : 'Std_Password';
    if (user[passwordField] !== currentPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    user[passwordField] = newPassword;
    await user.save();

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

module.exports = router;