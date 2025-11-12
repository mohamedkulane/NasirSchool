const Student = require('../models/Student');
const { generateStudentID } = require('../utils/idGenerator');
const { generateStudentExcel } = require('../utils/excelGenerator');
const ExcelJS = require('exceljs');

// Create Student
exports.createStudent = async (req, res) => {
  try {
    const Std_ID = await generateStudentID();
    const studentData = {
      ...req.body,
      Std_ID,
      Std_Password: Std_ID // Default password same as ID
    };
    
    const student = new Student(studentData);
    await student.save();
    
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Students (Active only by default) with PAGINATION
exports.getStudents = async (req, res) => {
  try {
    const { status, class: className, search, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (status) filter.Status = status;
    if (className) filter.Class = className;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { Std_Name: { $regex: search, $options: 'i' } },
        { Std_ID: { $regex: search, $options: 'i' } },
        { parent_Name: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination info
    const total = await Student.countDocuments(filter);
    
    // Get students with pagination
    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalStudents: total,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export Students to Excel
exports.exportStudents = async (req, res) => {
  try {
    const { className, status } = req.query;
    let filter = {};
    
    if (className) filter.Class = className;
    if (status) filter.Status = status;
    
    const students = await Student.find(filter);
    
    // Create workbook
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
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Import Students from Excel
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
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
        
        // Validate required fields
        if (!studentData.Std_Name || !studentData.parent_Name || !studentData.parent_phone || !studentData.Class) {
          errors.push(`Row ${i}: Missing required fields`);
          continue;
        }
        
        // Generate student ID
        const Std_ID = await generateStudentID();
        studentData.Std_ID = Std_ID;
        studentData.Std_Password = Std_ID;
        
        students.push(studentData);
      } catch (error) {
        errors.push(`Row ${i}: ${error.message}`);
      }
    }
    
    // Insert all students
    if (students.length > 0) {
      await Student.insertMany(students);
    }
    
    res.json({
      success: true,
      imported: students.length,
      errors: errors,
      message: `Successfully imported ${students.length} students`
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};