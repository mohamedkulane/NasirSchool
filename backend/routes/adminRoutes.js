const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Expense = require('../models/Expense');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const upload = require('../middleware/upload'); // Make sure this exists

// === STUDENT ROUTES ===
// ✅ FIXED: Export students with debug logs
router.get('/students/export', async (req, res) => {
  try {
    console.log('🔵 EXPORT REQUEST RECEIVED - Query params:', req.query);
    
    const { className } = req.query;
    let filter = {};
    
    if (className) filter.Class = className;
    
    console.log('🔵 Database filter:', filter);
    
    const students = await Student.find(filter);
    console.log(`🔵 Found ${students.length} students for export`);
    
    // Create workbook
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');
    
    // Add headers
    worksheet.columns = [
      { header: 'Student ID', key: 'Std_ID', width: 15 },
      { header: 'Student Name', key: 'Std_Name', width: 25 },
      { header: 'Parent Name', key: 'parent_Name', width: 25 },
      { header: 'Parent Phone', key: 'parent_phone', width: 15 },
      { header: 'Gender', key: 'Gender', width: 10 },
      { header: 'Class', key: 'Class', width: 15 },
      { header: 'Shift', key: 'Shift', width: 10 },
      { header: 'Status', key: 'Status', width: 10 }
    ];
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF102C57' }
    };
    headerRow.alignment = { horizontal: 'center' };
    
    // Add data
    students.forEach(student => {
      worksheet.addRow({
        Std_ID: student.Std_ID,
        Std_Name: student.Std_Name,
        parent_Name: student.parent_Name,
        parent_phone: student.parent_phone,
        Gender: student.Gender,
        Class: student.Class,
        Shift: student.Shift,
        Status: student.Status
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.xlsx`);
    
    console.log('✅ EXPORT SUCCESS - Sending file with', students.length, 'students');
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('❌ EXPORT ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
});

// ✅ MULTIPLE STUDENTS IMPORT ONLY (NO SINGLE STUDENT)
router.post('/students/import', upload.single('file'), async (req, res) => {
  try {
    console.log('🔵 MULTIPLE STUDENTS IMPORT REQUEST RECEIVED');
    console.log('🔵 Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false, 
        error: 'Please select an Excel file to import multiple students' 
      });
    }
    
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    console.log('🔵 Loading Excel file...');
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    console.log(`🔵 Processing ${worksheet.rowCount - 1} rows`);
    
    const students = [];
    const errors = [];
    
    // Start from row 2 (skip header)
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      try {
        const studentData = {
          Std_Name: row.getCell(1).value?.toString() || '',
          parent_Name: row.getCell(2).value?.toString() || '',
          parent_phone: row.getCell(3).value?.toString() || '',
          Gender: row.getCell(4).value?.toString() || 'Male',
          Class: row.getCell(5).value?.toString() || '',
          Shift: row.getCell(6).value?.toString() || 'morning',
          Status: row.getCell(7).value?.toString() || 'active'
        };
        
        console.log(`🔵 Processing row ${i}:`, studentData);
        
        // Validate required fields
        if (!studentData.Std_Name || !studentData.parent_Name || !studentData.parent_phone || !studentData.Class) {
          errors.push(`Row ${i}: Missing required fields`);
          continue;
        }
        
        // Generate student ID
        const { generateStudentID } = require('../utils/idGenerator');
        const Std_ID = await generateStudentID();
        studentData.Std_ID = Std_ID;
        studentData.Std_Password = Std_ID;
        
        students.push(studentData);
      } catch (error) {
        console.error(`❌ Error in row ${i}:`, error);
        errors.push(`Row ${i}: ${error.message}`);
      }
    }
    
    console.log(`🔵 Valid students: ${students.length}, Errors: ${errors.length}`);
    
    // Insert all students
    if (students.length > 0) {
      console.log('🔵 Inserting students to database...');
      await Student.insertMany(students);
    }
    
    console.log('✅ MULTIPLE STUDENTS IMPORT SUCCESS - Imported', students.length, 'students');
    
    res.json({
      success: true,
      imported: students.length,
      errors: errors,
      message: `Successfully imported ${students.length} students`
    });
    
  } catch (error) {
    console.error('❌ IMPORT ERROR:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});


// Get all students
router.get('/students', async (req, res) => {
  try {
    const { status, class: className } = req.query;
    let filter = {};
    
    if (status) filter.Status = status;
    if (className) filter.Class = className;
    
    const students = await Student.find(filter);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create student
router.post('/students', async (req, res) => {
  try {
    const { generateStudentID } = require('../utils/idGenerator');
    const Std_ID = await generateStudentID();
    const studentData = {
      ...req.body,
      Std_ID,
      Std_Password: Std_ID
    };
    
    const student = new Student(studentData);
    await student.save();
    
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export students
router.get('/students/export', async (req, res) => {
  try {
    const { className } = req.query;
    let filter = { Status: 'active' };
    
    if (className) filter.Class = className;
    
    const students = await Student.find(filter);
    const { generateStudentExcel } = require('../utils/excelGenerator');
    const workbook = generateStudentExcel(students);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === TEACHER ROUTES ===

// Get all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create teacher
router.post('/teachers', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    
    const { password, ...teacherResponse } = teacher.toObject();
    res.status(201).json({ success: true, data: teacherResponse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update teacher
router.put('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }
    
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }
    
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


const ExcelJS = require('exceljs'); // Make sure to install: npm install exceljs

// === EXPENSE ROUTES ===

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const { startDate, endDate, item } = req.query;
    let filter = {};
    
    // Build date filter
    if (startDate || endDate) {
      filter.E_date = {};
      if (startDate) filter.E_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.E_date.$lte = end;
      }
    }
    
    // Build item filter
    if (item) {
      filter.E_item = { $regex: item, $options: 'i' };
    }
    
    console.log('Expenses filter:', filter);
    
    const expenses = await Expense.find(filter).sort({ E_date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ ADD EXPENSES EXPORT ROUTE
router.get('/expenses/export', async (req, res) => {
  try {
    console.log('🔵 EXPENSES EXPORT REQUEST - Query params:', req.query);
    
    const { startDate, endDate, item } = req.query;
    let filter = {};
    
    // Build date filter
    if (startDate || endDate) {
      filter.E_date = {};
      if (startDate) filter.E_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.E_date.$lte = end;
      }
    }
    
    // Build item filter
    if (item) {
      filter.E_item = { $regex: item, $options: 'i' };
    }
    
    console.log('🔵 Expenses export filter:', filter);
    
    const expenses = await Expense.find(filter).sort({ E_date: -1 });
    console.log(`🔵 Found ${expenses.length} expenses for export`);
    
    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No expenses found for the selected filters'
      });
    }
    
    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');
    
    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Item', key: 'item', width: 30 },
      { header: 'Amount ($)', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 40 }
    ];
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F200D' } // Your brand color
    };
    headerRow.alignment = { horizontal: 'center' };
    
    // Add data rows
    let totalAmount = 0;
    expenses.forEach(expense => {
      const row = worksheet.addRow({
        date: new Date(expense.E_date).toLocaleDateString(),
        item: expense.E_item,
        amount: expense.E_amount,
        description: expense.E_description || 'No description'
      });
      
      // Style amount column
      const amountCell = row.getCell('amount');
      amountCell.numFmt = '$#,##0.00';
      amountCell.font = { bold: true };
      
      totalAmount += expense.E_amount;
    });
    
    // Add summary row
    worksheet.addRow({}); // Empty row
    const summaryRow = worksheet.addRow({
      date: 'TOTAL',
      item: '',
      amount: totalAmount,
      description: `${expenses.length} expenses`
    });
    
    // Style summary row
    summaryRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF9A00' } // Your brand color
    };
    
    const summaryAmountCell = summaryRow.getCell('amount');
    summaryAmountCell.numFmt = '$#,##0.00';
    
    // Generate filename
    let filename = 'expenses';
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    console.log('✅ EXPENSES EXPORT SUCCESS - Sending file with', expenses.length, 'expenses');
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('❌ EXPENSES EXPORT ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

// Create expense
router.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get expense statistics
router.get('/expenses/stats', async (req, res) => {
  try {
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$E_amount' } } }
    ]);

    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          E_date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: { _id: null, total: { $sum: '$E_amount' } }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalExpenses[0]?.total || 0,
        monthly: monthlyExpenses[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});




// === EXAM RESULT ROUTES === (FIXED VERSION)

// Get exam results with filters
router.get('/exam-results', async (req, res) => {
  try {
    const { className, subject, exam_type } = req.query;
    
    console.log('Fetching exam results with filters:', { className, subject, exam_type });
    
    // Build filter object
    const filter = {};
    if (className) filter.class = className;
    if (subject && subject !== '') filter.subject = subject;
    if (exam_type && exam_type !== 'all') filter.exam_type = exam_type;
    
    console.log('Database filter:', filter);

    const results = await ExamResult.find(filter)
      .populate('student', 'Std_ID Std_Name')
      .populate('teacher', 'T_Name')
      .sort({ createdAt: -1 });

    console.log(`Found ${results.length} results`);

    res.json({ 
      success: true, 
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export exam results with filters
router.get('/exam-results/export', async (req, res) => {
  try {
    const { className, subject, exam_type } = req.query;
    
    console.log('Export request with filters:', { className, subject, exam_type });

    // Validate required parameters
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required for export'
      });
    }

    // Build filter object
    const filter = { class: className };
    if (subject && subject !== '') filter.subject = subject;
    if (exam_type && exam_type !== 'all') filter.exam_type = exam_type;

    console.log('Export database filter:', filter);

    // Fetch results from database
    const results = await ExamResult.find(filter)
      .populate('student', 'Std_ID Std_Name parent_Name parent_phone Gender Class Shift Status')
      .sort({ createdAt: -1 });

    console.log(`Found ${results.length} results for export`);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No exam results found for the selected filters'
      });
    }

    // Generate Excel file with filters
    const { generateExamResultExcel } = require('../utils/excelGenerator');
    const workbook = generateExamResultExcel(results, { 
      className, 
      subject, 
      exam_type 
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    const filename = `exam_results_${className}_${subject || 'all'}_${exam_type}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Send the file
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating Excel file: ' + error.message 
    });
  }
});
// === ATTENDANCE ROUTES ===

// Get attendance
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
      .populate('student', 'Std_ID Std_Name Class')
      .populate('teacher', 'T_Name');

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get absent today
router.get('/attendance/absent-today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allStudents = await Student.find({ Status: 'active' });
    const attendedStudents = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      status: 'present'
    }).distinct('student');

    const absentStudents = allStudents.filter(student => 
      !attendedStudents.some(attendedId => 
        attendedId.toString() === student._id.toString()
      )
    );

    res.json({ success: true, data: absentStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === DASHBOARD ROUTES ===

// Admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ Status: 'active' });
    const totalTeachers = await Teacher.countDocuments();
    
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$E_amount' } } }
    ]);

    const genderStats = await Student.aggregate([
      { $match: { Status: 'active' } },
      { $group: { _id: '$Gender', count: { $sum: 1 } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.aggregate([
      {
        $match: { date: { $gte: today, $lt: tomorrow } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const presentToday = todayAttendance.find(a => a._id === 'present')?.count || 0;
    const absentToday = todayAttendance.find(a => a._id === 'absent')?.count || 0;

    res.json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          teachers: totalTeachers,
          expenses: totalExpenses[0]?.total || 0
        },
        genderDistribution: genderStats,
        attendance: {
          present: presentToday,
          absent: absentToday
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;