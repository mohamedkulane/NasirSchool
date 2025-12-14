const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};



// student login new fervion
// student LOGIN ENDPOINT 
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
        loginAllowed: student.loginAllowed // Ku dar token-ka
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



// ✅ TEACHER LOGIN WITH ENHANCED SECURITY
router.post('/teacher/login', async (req, res) => {
  try {
    const { User_Name, password } = req.body;

    console.log('Teacher login attempt for:', User_Name);

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
        error: 'Invalid username or password' 
      });
    }

    // ✅ STRICT LOGIN ALLOWED CHECK - MUST BE EXPLICITLY TRUE
    if (teacher.loginAllowed !== true) {
      console.log('Login blocked for teacher:', teacher.T_Name, 'loginAllowed:', teacher.loginAllowed);
      
      return res.status(403).json({ 
        success: false, 
        error: 'Your account has been suspended. Please contact the administrator.' 
      });
    }

    // Verify password
    if (teacher.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // ✅ UPDATE LAST LOGIN
    teacher.lastLogin = new Date();
    
    // ✅ INCREMENT TOKEN VERSION ON EVERY LOGIN (FOR SECURITY)
    if (!teacher.tokenVersion) {
      teacher.tokenVersion = 1;
    } else {
      teacher.tokenVersion += 1;
    }
    
    await teacher.save();

    // ✅ CREATE TOKEN WITH TOKEN VERSION
    const token = jwt.sign(
      { 
        userId: teacher._id,
        role: 'teacher',
        tokenVersion: teacher.tokenVersion,
        userName: teacher.User_Name
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' } // Shorter expiry for security
    );

    // ✅ DON'T SEND PASSWORD IN RESPONSE
    const teacherData = teacher.toObject();
    delete teacherData.password;

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
        loginAllowed: teacher.loginAllowed,
        lastLogin: teacher.lastLogin
      }
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again later.' 
    });
  }
});

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