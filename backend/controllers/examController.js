const ExamResult = require('../models/ExamResult');
const { generateExamResultExcel } = require('../utils/excelGenerator');

// Get Exam Results with filters
exports.getExamResults = async (req, res) => {
  try {
    const { className, subject, exam_type } = req.query;
    
    console.log('Fetching results with filters:', { className, subject, exam_type });

    // Build filter - ONLY FILTER BY CLASS AND EXAM TYPE
    const filter = { class: className };
    
    if (exam_type && exam_type !== 'all') {
      filter.exam_type = exam_type;
    }
    
    if (subject && subject !== '') {
      filter.subject = subject;
    }

    console.log('Database filter:', filter);

    const results = await ExamResult.find(filter)
      .populate('student', 'Std_ID Std_Name')
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
};

// Export Exam Results to Excel
exports.exportExamResults = async (req, res) => {
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

    // Build filter - ONLY FILTER BY CLASS AND EXAM TYPE
    const filter = { class: className };
    
    if (exam_type && exam_type !== 'all') {
      filter.exam_type = exam_type;
    }
    
    if (subject && subject !== '') {
      filter.subject = subject;
    }

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
};