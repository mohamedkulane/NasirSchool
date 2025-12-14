const express = require('express');
const router = express.Router();
const { authenticateTeacher } = require('../middleware/authMiddleware');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// ✅ TEACHER AUTHENTICATION MIDDLEWARE FOR ALL ROUTES
router.use(authenticateTeacher);

//change password route
router.put('/change-password', async (req, res) => {
  try {
    console.log('🔵 Teacher changing password:', req.teacher._id);
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const teacher = await Teacher.findById(req.teacher._id);
    
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

    console.log('✅ Password changed for teacher:', teacher.T_Name);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// routes/teacher.js
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    
    console.log('Fetching dashboard for teacher:', req.teacher.T_Name);
    
    // ✅ Get student counts for teacher's classes
    const studentCounts = await Student.aggregate([
      {
        $match: { 
          Class: { $in: req.teacher.T_class },
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

    // ✅ Convert aggregate results to counts
    let maleCount = 0;
    let femaleCount = 0;
    let totalCount = 0;

    studentCounts.forEach(item => {
      if (item._id === 'Male') maleCount = item.count;
      if (item._id === 'Female') femaleCount = item.count;
      totalCount += item.count;
    });

    // ✅ Get exam statistics
    const examStats = await ExamResult.aggregate([
      {
        $match: { 
          class: { $in: req.teacher.T_class }
        }
      },
      {
        $group: {
          _id: '$subject',
          examCount: { $sum: 1 }
        }
      }
    ]);

    // ✅ Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const recentAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
          class: { $in: req.teacher.T_class }
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

    // ✅ Format subjects with exam data
    const formattedSubjects = req.teacher.T_subject.map(subject => {
      const examData = examStats.find(s => s._id === subject);
      return {
        subject: subject,
        examsCompleted: examData?.examCount || 0,
        hasExams: !!examData
      };
    });

    res.json({
      success: true,
      data: {
        teacherInfo: {
          name: req.teacher.T_Name,
          classes: req.teacher.T_class,
          subjects: req.teacher.T_subject
        },
        students: { // ✅ FIXED: Add students object
          total: totalCount,
          male: maleCount,
          female: femaleCount
        },
        subjects: formattedSubjects, // ✅ FIXED: Use formatted subjects
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

// ✅ GET EXISTING EXAM RESULTS - FIXED VERSION
router.get('/exam-results', async (req, res) => {
  try {
    const { class: className, subject, exam_type } = req.query;
    
    console.log('🔵 TEACHER FETCHING RESULTS:', {
      teacher: req.teacher.T_Name,
      className,
      subject,
      exam_type
    });

    // ✅ Build filter based on teacher's classes
    let filter = {
      $or: [
        { teacher: req.teacher._id },
        { class: { $in: req.teacher.T_class } }
      ]
    };

    // Add additional filters if provided
    if (className && className !== 'all') {
      filter.class = className;
    }
    
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    
    if (exam_type && exam_type !== 'all') {
      filter.exam_type = exam_type;
    }

    console.log('🔵 Database filter:', filter);

    // ✅ Fetch results with proper population
    const results = await ExamResult.find(filter)
      .populate({
        path: 'student',
        select: 'Std_ID Std_Name Gender Class',
        model: 'Student'
      })
      .populate({
        path: 'teacher',
        select: 'T_Name User_Name',
        model: 'Teacher'
      })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${results.length} exam results`);

    // ✅ Format response
    const formattedResults = results.map(result => ({
      _id: result._id,
      student: result.student ? {
        _id: result.student._id,
        Std_ID: result.student.Std_ID,
        Std_Name: result.student.Std_Name,
        Gender: result.student.Gender,
        Class: result.student.Class
      } : null,
      class: result.class,
      subject: result.subject,
      exam_type: result.exam_type,
      marks: result.marks,
      createdBy: result.teacher ? {
        _id: result.teacher._id,
        name: result.teacher.T_Name
      } : null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));

    res.json({
      success: true,
      count: results.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('❌ Error fetching exam results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ GET STUDENTS BY CLASS - FIXED
router.get('/students-by-class', async (req, res) => {
  try {
    const { className } = req.query;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    // Check if teacher has access to this class
    if (!req.teacher.T_class.includes(className)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this class'
      });
    }

    const students = await Student.find({
      Class: className,
      Status: 'active'
    }).select('_id Std_ID Std_Name Gender Class parent_phone Status');

    res.json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// In teacherRoutes.js, update the POST /exam-results route:
router.post('/exam-results', async (req, res) => {
  try {
    // ✅ Accept both studentId and student
    const { studentId, student: studentParam, class: className, subject, exam_type, marks } = req.body;
    
    // ✅ Use studentId if provided, otherwise use student
    const actualStudentId = studentId || studentParam;
    
    // Validation
    if (!actualStudentId || !className || !subject || !exam_type || marks === undefined) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check teacher access to class
    if (!req.teacher.T_class.includes(className)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this class'
      });
    }

    // Check if student exists and belongs to the class
    const student = await Student.findOne({
      _id: actualStudentId,
      Class: className,
      Status: 'active'
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found in this class'
      });
    }

    // Check if result already exists
    const existingResult = await ExamResult.findOne({
      student: actualStudentId,
      class: className,
      subject: subject,
      exam_type: exam_type,
      teacher: req.teacher._id
    });

    let result;
    
    if (existingResult) {
      // Update existing result
      result = await ExamResult.findByIdAndUpdate(
        existingResult._id,
        {
          marks: marks,
          updatedAt: new Date()
        },
        { new: true }
      );
    } else {
      // Create new result
      result = new ExamResult({
        student: actualStudentId,
        class: className,
        subject: subject,
        exam_type: exam_type,
        marks: marks,
        teacher: req.teacher._id
      });
      
      await result.save();
    }

    // Populate student info
    const populatedResult = await ExamResult.findById(result._id)
      .populate('student', 'Std_ID Std_Name Gender Class');

    res.status(200).json({
      success: true,
      message: existingResult ? 'Result updated successfully' : 'Result created successfully',
      data: populatedResult
    });

  } catch (error) {
    console.error('Error creating/updating exam result:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ BULK CREATE/UPDATE EXAM RESULTS
router.post('/exam-results/bulk', async (req, res) => {
  try {
    const { results, className } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No results provided'
      });
    }

    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    // Check teacher access
    if (!req.teacher.T_class.includes(className)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this class'
      });
    }

    const bulkOperations = [];
    const errors = [];

    for (const item of results) {
      try {
        const { studentId, subject, exam_type, marks } = item;

        if (!studentId || !subject || !exam_type || marks === undefined) {
          errors.push({
            studentId,
            error: 'Missing required fields'
          });
          continue;
        }

        const filter = {
          student: studentId,
          class: className,
          subject: subject,
          exam_type: exam_type,
          teacher: req.teacher._id
        };

        bulkOperations.push({
          updateOne: {
            filter: filter,
            update: {
              $set: {
                marks: marks,
                updatedAt: new Date()
              },
              $setOnInsert: {
                student: studentId,
                class: className,
                subject: subject,
                exam_type: exam_type,
                teacher: req.teacher._id,
                createdAt: new Date()
              }
            },
            upsert: true
          }
        });

      } catch (error) {
        errors.push({
          studentId: item.studentId,
          error: error.message
        });
      }
    }

    if (bulkOperations.length > 0) {
      await ExamResult.bulkWrite(bulkOperations);
    }

    res.json({
      success: true,
      message: `Processed ${bulkOperations.length} results successfully`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ DASHBOARD - SIMPLIFIED
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.teacher._id;
    
    // Get counts
    const studentCount = await Student.countDocuments({
      Class: { $in: req.teacher.T_class },
      Status: 'active'
    });

    const examCount = await ExamResult.countDocuments({
      teacher: teacherId
    });

    // Get recent results
    const recentResults = await ExamResult.find({
      teacher: teacherId
    })
      .populate('student', 'Std_Name Class')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        teacherInfo: {
          name: req.teacher.T_Name,
          classes: req.teacher.T_class,
          subjects: req.teacher.T_subject
        },
        counts: {
          students: studentCount,
          exams: examCount
        },
        recentResults: recentResults
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

// ✅ UPDATE SINGLE EXAM RESULT - FIXED VERSION
router.put('/exam-results/:id', async (req, res) => {
  try {
    const { marks } = req.body;
    const resultId = req.params.id;

    if (!marks && marks !== 0) {
      return res.status(400).json({
        success: false,
        error: 'Marks are required'
      });
    }

    const result = await ExamResult.findById(resultId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Exam result not found'
      });
    }

    // ✅ FIX: Check if teacher exists before comparing
    if (result.teacher) {
      // Check if teacher has access to this result
      if (result.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this result'
        });
      }
    } else {
      // ✅ If result doesn't have a teacher, assign current teacher
      result.teacher = req.teacher._id;
    }

    result.marks = marks;
    result.updatedAt = new Date();
    await result.save();

    // ✅ Populate the result before sending
    const populatedResult = await ExamResult.findById(result._id)
      .populate('student', 'Std_ID Std_Name Gender Class');

    res.json({
      success: true,
      message: 'Result updated successfully',
      data: populatedResult
    });

  } catch (error) {
    console.error('❌ Error updating exam result:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ DELETE EXAM RESULT - FIXED VERSION
router.delete('/exam-results/:id', async (req, res) => {
  try {
    const resultId = req.params.id;

    const result = await ExamResult.findById(resultId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Exam result not found'
      });
    }

    // ✅ FIX: Check if teacher exists before comparing
    if (result.teacher) {
      // Check if teacher has access to this result
      if (result.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to delete this result'
        });
      }
    } else {
      // ✅ If result doesn't have a teacher, assign current teacher before deletion
      result.teacher = req.teacher._id;
      await result.save();
    }

    await ExamResult.findByIdAndDelete(resultId);

    res.json({
      success: true,
      message: 'Result deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting exam result:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;