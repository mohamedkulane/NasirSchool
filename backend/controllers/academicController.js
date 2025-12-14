// controllers/academicController.js
const AcademicYear = require('../models/AcademicYear');
const Student = require('../models/Student');
const StudentAcademicHistory = require('../models/StudentAcademicHistory');
const { generateStudentID } = require('../utils/idGenerator');

// Get all academic years
exports.getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ yearName: -1 });
    res.json({ success: true, data: academicYears });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new academic year
exports.createAcademicYear = async (req, res) => {
  try {
    const { yearName, startDate, endDate } = req.body;
    
    // Check if year already exists
    const existingYear = await AcademicYear.findOne({ yearName });
    if (existingYear) {
      return res.status(400).json({ 
        success: false, 
        error: 'Academic year already exists' 
      });
    }

    const academicYear = new AcademicYear({
      yearName,
      startDate,
      endDate,
      isActive: false
    });

    await academicYear.save();
    res.status(201).json({ success: true, data: academicYear });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Set academic year as active
exports.setActiveAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    
    const academicYear = await AcademicYear.findById(id);
    if (!academicYear) {
      return res.status(404).json({ success: false, error: 'Academic year not found' });
    }

    academicYear.isActive = true;
    await academicYear.save();

    res.json({ 
      success: true, 
      message: `${academicYear.yearName} set as active academic year` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete academic year
exports.completeAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    
    const academicYear = await AcademicYear.findById(id);
    if (!academicYear) {
      return res.status(404).json({ success: false, error: 'Academic year not found' });
    }

    academicYear.isCompleted = true;
    academicYear.isActive = false;
    await academicYear.save();

    res.json({ 
      success: true, 
      message: `${academicYear.yearName} marked as completed` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get students by academic year and class
exports.getStudentsByAcademicYear = async (req, res) => {
  try {
    const { academicYear, className } = req.query;
    
    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (className) filter.class = className;

    const students = await StudentAcademicHistory.find(filter)
      .populate('student', 'Std_ID Std_Name parent_Name parent_phone Gender Status')
      .sort({ class: 1, 'student.Std_Name': 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Transfer students to new academic year
exports.transferStudents = async (req, res) => {
  try {
    const { 
      sourceAcademicYear, 
      targetAcademicYear, 
      sourceClass, 
      targetClass,
      studentIds 
    } = req.body;

    // Validate academic years
    const sourceYear = await AcademicYear.findOne({ yearName: sourceAcademicYear });
    const targetYear = await AcademicYear.findOne({ yearName: targetAcademicYear });
    
    if (!sourceYear || !targetYear) {
      return res.status(404).json({ 
        success: false, 
        error: 'Academic year not found' 
      });
    }

    const results = {
      transferred: [],
      failed: []
    };

    // Transfer each student
    for (const studentId of studentIds) {
      try {
        // Find student's current academic record
        const currentRecord = await StudentAcademicHistory.findOne({
          student: studentId,
          academicYear: sourceAcademicYear,
          class: sourceClass
        });

        if (!currentRecord) {
          results.failed.push({
            studentId,
            reason: 'Student not found in source class'
          });
          continue;
        }

        // Check if student already exists in target academic year
        const existingRecord = await StudentAcademicHistory.findOne({
          student: studentId,
          academicYear: targetAcademicYear
        });

        if (existingRecord) {
          results.failed.push({
            studentId,
            reason: 'Student already exists in target academic year'
          });
          continue;
        }

        // Create new academic history record for target year
        const newRecord = new StudentAcademicHistory({
          student: studentId,
          academicYear: targetAcademicYear,
          class: targetClass,
          transferredFrom: sourceClass,
          transferredDate: new Date(),
          status: 'active'
        });

        await newRecord.save();

        // Update current record status
        currentRecord.status = 'transferred';
        await currentRecord.save();

        results.transferred.push({
          studentId,
          from: `${sourceAcademicYear} - ${sourceClass}`,
          to: `${targetAcademicYear} - ${targetClass}`
        });

      } catch (error) {
        results.failed.push({
          studentId,
          reason: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      summary: {
        total: studentIds.length,
        transferred: results.transferred.length,
        failed: results.failed.length
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk transfer (all students in a class)
exports.bulkTransferClass = async (req, res) => {
  try {
    const { 
      sourceAcademicYear, 
      targetAcademicYear, 
      sourceClass, 
      targetClass 
    } = req.body;

    // Get all students in source class for source academic year
    const students = await StudentAcademicHistory.find({
      academicYear: sourceAcademicYear,
      class: sourceClass,
      status: 'active'
    }).populate('student');

    const studentIds = students.map(s => s.student._id);

    // Use the transferStudents function
    const transferResult = await exports.transferStudents({
      body: {
        sourceAcademicYear,
        targetAcademicYear,
        sourceClass,
        targetClass,
        studentIds
      }
    }, res);

    return transferResult;

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student academic history
exports.getStudentAcademicHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const history = await StudentAcademicHistory.find({ student: studentId })
      .sort({ academicYear: -1 })
      .populate('student', 'Std_ID Std_Name');

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update initializeAcademicYear in academicController.js
exports.initializeAcademicYear = async (req, res) => {
  try {
    const { targetAcademicYear, baseAcademicYear } = req.body;

    console.log(`Initializing ${targetAcademicYear} from ${baseAcademicYear}`);

    // 1. First, check if base academic year has students
    let baseStudents = await StudentAcademicHistory.find({
      academicYear: baseAcademicYear,
      status: { $in: ['active', 'transferred'] }
    }).populate('student');

    console.log(`Found ${baseStudents.length} students in ${baseAcademicYear}`);

    // 2. If no students in base year, create them from all active students
    if (baseStudents.length === 0) {
      console.log(`No students found in ${baseAcademicYear}. Creating base records first...`);
      
      const activeStudents = await Student.find({ Status: 'active' });
      
      for (const student of activeStudents) {
        const baseRecord = new StudentAcademicHistory({
          student: student._id,
          academicYear: baseAcademicYear,
          class: student.Class || 'class 1B',
          status: 'active',
          notes: 'Auto-created for initialization'
        });
        await baseRecord.save();
        
        // Add to baseStudents array
        baseStudents.push({
          student: student,
          class: student.Class || 'class 1B',
          status: 'active'
        });
      }
      
      console.log(`Created ${activeStudents.length} base records`);
    }

    const results = {
      initialized: 0,
      skipped: 0,
      errors: []
    };

    // 3. Now create records for target academic year
    for (const baseRecord of baseStudents) {
      try {
        const studentId = baseRecord.student?._id || baseRecord.student;
        
        // Check if student already exists in target year
        const existingTargetRecord = await StudentAcademicHistory.findOne({
          student: studentId,
          academicYear: targetAcademicYear
        });

        if (existingTargetRecord) {
          results.skipped++;
          continue;
        }

        // Create new record
        const newRecord = new StudentAcademicHistory({
          student: studentId,
          academicYear: targetAcademicYear,
          class: baseRecord.class,
          status: 'active',
          notes: `Initialized from ${baseAcademicYear}`
        });

        await newRecord.save();
        results.initialized++;

      } catch (error) {
        results.errors.push({
          studentId: baseRecord.student?._id || 'Unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Initialized ${results.initialized} students for ${targetAcademicYear} from ${baseAcademicYear}`
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Export
exports.exportAcademicHistories = async (req, res) => {
  try {
    const { academicYear, className, status, search } = req.query;
    
    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (className) filter.class = className;
    if (status) filter.status = status;

    let query = StudentAcademicHistory.find(filter)
      .populate('student', 'Std_ID Std_Name parent_Name parent_phone Gender Status');

    if (search) {
      query = query.populate({
        path: 'student',
        match: {
          $or: [
            { Std_Name: { $regex: search, $options: 'i' } },
            { Std_ID: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const histories = await query.sort({ academicYear: -1, class: 1 });

    // Filter out null students from search
    const filteredHistories = histories.filter(history => history.student != null);

    // Convert to CSV or Excel (simplified example)
    const csvData = filteredHistories.map(history => ({
      'Student ID': history.student?.Std_ID || '',
      'Student Name': history.student?.Std_Name || '',
      'Academic Year': history.academicYear,
      'Class': history.class,
      'Status': history.status,
      'Parent Name': history.student?.parent_Name || '',
      'Parent Phone': history.student?.parent_phone || ''
    }));

    // Send as JSON for now (you can implement CSV/Excel export)
    res.json({ success: true, data: csvData });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add this function to academicController.js
exports.populateBaseAcademicYear = async (req, res) => {
  try {
    const { academicYear } = req.body;

    console.log(`Populating base academic year: ${academicYear}`);

    // Get all active students
    const activeStudents = await Student.find({ Status: 'active' });
    
    console.log(`Found ${activeStudents.length} active students`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const student of activeStudents) {
      try {
        // Check if student already has academic history for this year
        const existingRecord = await StudentAcademicHistory.findOne({
          student: student._id,
          academicYear: academicYear
        });

        if (existingRecord) {
          console.log(`Student ${student.Std_ID} already has record for ${academicYear}`);
          skippedCount++;
          continue;
        }

        // Create new academic history record
        const newRecord = new StudentAcademicHistory({
          student: student._id,
          academicYear: academicYear,
          class: student.Class || 'class 1B', // Use student's current class
          status: 'active',
          notes: 'Initial enrollment'
        });

        await newRecord.save();
        createdCount++;
        
        console.log(`Created record for ${student.Std_ID} in ${academicYear}`);

      } catch (error) {
        console.error(`Error for student ${student.Std_ID}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Populated ${createdCount} students in ${academicYear}. ${skippedCount} already existed.`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        total: activeStudents.length
      }
    });

  } catch (error) {
    console.error('Populate error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};