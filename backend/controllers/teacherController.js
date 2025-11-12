const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');

// Create Teacher
exports.createTeacher = async (req, res) => {
  try {
    const { password, ...teacherData } = req.body;
    
    // Check if username already exists
    const existingTeacher = await Teacher.findOne({ User_Name: teacherData.User_Name });
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }

    const teacher = new Teacher({
      ...teacherData,
      password: password // Store as plain text as per requirement
    });

    await teacher.save();

    // Don't send password in response
    const { password: _, ...teacherResponse } = teacher.toObject();

    res.status(201).json({ 
      success: true, 
      message: 'Teacher created successfully',
      data: teacherResponse 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get All Teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.json({ 
      success: true, 
      data: teachers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({ 
      success: true, 
      data: teacher 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If password is being updated
    if (password) {
      updateData.password = password;
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Teacher updated successfully',
      data: teacher 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete Teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Teacher deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Teacher Dashboard Data
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const Teacher = require('../models/Teacher');
    const Student = require('../models/Student');
    const ExamResult = require('../models/ExamResult');
    const Attendance = require('../models/Attendance');

    const teacher = await Teacher.findById(teacherId);
    
    // Get student counts for teacher's classes
    const studentCounts = await Student.aggregate([
      {
        $match: { 
          Class: { $in: teacher.T_class },
          Status: 'active'
        }
      },
      {
        $group: {
          _id: '$Gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get exam completion status
    const subjectsWithExams = await ExamResult.aggregate([
      {
        $match: { 
          teacher: teacherId 
        }
      },
      {
        $group: {
          _id: '$subject',
          examCount: { $sum: 1 }
        }
      }
    ]);

    // Get recent attendance for teacher's classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentAttendance = await Attendance.aggregate([
      {
        $match: {
          teacher: teacherId,
          date: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$class',
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const maleCount = studentCounts.find(s => s._id === 'Male')?.count || 0;
    const femaleCount = studentCounts.find(s => s._id === 'Female')?.count || 0;

    res.json({
      success: true,
      data: {
        teacherInfo: {
          name: teacher.T_Name,
          classes: teacher.T_class,
          subjects: teacher.T_subject
        },
        studentStats: {
          total: maleCount + femaleCount,
          male: maleCount,
          female: femaleCount
        },
        subjects: teacher.T_subject.map(subject => {
          const examData = subjectsWithExams.find(s => s._id === subject);
          return {
            subject,
            examsCompleted: examData?.examCount || 0,
            hasExams: !!examData
          };
        }),
        attendance: recentAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};