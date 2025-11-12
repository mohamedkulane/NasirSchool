const express = require('express');
const router = express.Router();
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// ✅ Dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const { teacherId } = req.query;
    
    console.log('Fetching dashboard for teacher:', teacherId);
    
    if (!teacherId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Teacher ID is required' 
      });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

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

    // Get exam statistics
    const examStats = await ExamResult.aggregate([
      {
        $match: { 
          class: { $in: teacher.T_class }
        }
      },
      {
        $group: {
          _id: '$subject',
          examCount: { $sum: 1 }
        }
      }
    ]);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const recentAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
          class: { $in: teacher.T_class }
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
        students: {
          total: maleCount + femaleCount,
          male: maleCount,
          female: femaleCount
        },
        subjects: teacher.T_subject.map(subject => {
          const examData = examStats.find(s => s._id === subject);
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
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Get students by class
router.get('/students', async (req, res) => {
  try {
    const { class: className } = req.query;
    
    console.log('Fetching students for class:', className);
    
    if (!className) {
      return res.status(400).json({ 
        success: false, 
        error: 'Class parameter is required' 
      });
    }

    const students = await Student.find({ 
      Class: className,
      Status: 'active'
    }).select('Std_ID Std_Name Gender Class Status');

    console.log(`Found ${students.length} students for class ${className}`);

    res.json({ 
      success: true, 
      data: students 
    });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Get teacher's classes
router.get('/classes', async (req, res) => {
  try {
    const { teacherId } = req.query;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }

    res.json({ 
      success: true, 
      data: teacher.T_class 
    });
  } catch (error) {
    console.error('Classes error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Create exam result
router.post('/exam-results', async (req, res) => {
  try {
    const { student, class: className, subject, exam_type, marks } = req.body;
    
    // Check if result already exists
    const existingResult = await ExamResult.findOne({
      student,
      class: className,
      subject,
      exam_type
    });
    
    let result;
    if (existingResult) {
      // Update existing result
      result = await ExamResult.findByIdAndUpdate(
        existingResult._id,
        { marks },
        { new: true }
      );
    } else {
      // Create new result
      result = new ExamResult({
        student,
        class: className,
        subject,
        exam_type,
        marks
      });
      await result.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Exam result saved successfully',
      data: result 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Update exam result
router.put('/exam-results/:id', async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Exam result not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Exam result updated successfully',
      data: result 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Get teacher's exam results
router.get('/exam-results', async (req, res) => {
  try {
    const { class: className, subject } = req.query;
    
    let filter = {};
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    
    const results = await ExamResult.find(filter)
      .populate('student', 'Std_ID Std_Name Class')
      .sort({ 'student.Std_Name': 1 });
    
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

// ✅ Create attendance
router.post('/attendance', async (req, res) => {
  try {
    const { class: className, attendanceData } = req.body;
    
    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      class: className,
      date: { $gte: today, $lt: tomorrow }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        error: 'Attendance for this class already taken today' 
      });
    }
    
    // Create attendance records
    const attendanceRecords = attendanceData.map(item => ({
      student: item.studentId,
      class: className,
      date: new Date(),
      status: item.status || 'present'
    }));
    
    await Attendance.insertMany(attendanceRecords);
    
    res.status(201).json({ 
      success: true, 
      message: 'Attendance saved successfully',
      data: attendanceRecords 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ Get teacher's classes attendance
router.get('/attendance', async (req, res) => {
  try {
    const { class: className, date } = req.query;
    
    let filter = {};
    if (className) filter.class = className;
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    const attendance = await Attendance.find(filter)
      .populate('student', 'Std_ID Std_Name Class Gender')
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

// ✅ Change password (Updated with authentication)
router.put('/change-password', async (req, res) => {
  try {
    const { teacherId, currentPassword, newPassword } = req.body;
    
    console.log('Changing password for teacher:', teacherId);
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        error: 'Teacher not found' 
      });
    }
    
    // Check current password
    if (teacher.password !== currentPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }
    
    // Update password
    teacher.password = newPassword;
    await teacher.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;