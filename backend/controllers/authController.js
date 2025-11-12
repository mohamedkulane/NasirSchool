const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { Std_ID, Std_Password } = req.body;

    const student = await Student.findOne({ Std_ID, Status: 'active' });
    if (!student) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    if (student.Std_Password !== Std_Password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
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
    res.status(500).json({ success: false, error: error.message });
  }
};

// Teacher Login
exports.teacherLogin = async (req, res) => {
  try {
    const { User_Name, password } = req.body;

    const teacher = await Teacher.findOne({ User_Name });
    if (!teacher) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // For teachers, we'll use a simple password comparison
    // In production, you should hash teacher passwords too
    if (teacher.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(teacher._id, 'teacher');

    res.json({
      success: true,
      token,
      user: {
        id: teacher._id,
        name: teacher.T_Name,
        role: 'teacher',
        classes: teacher.T_class,
        subjects: teacher.T_subject
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Login (You can create admin users separately)
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple admin authentication - in production use proper admin model
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
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
    res.status(500).json({ success: false, error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    let user;
    if (role === 'student') {
      user = await Student.findById(userId);
      if (!user || user.Std_Password !== currentPassword) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
      user.Std_Password = newPassword;
    } else if (role === 'teacher') {
      user = await Teacher.findById(userId);
      if (!user || user.password !== currentPassword) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};