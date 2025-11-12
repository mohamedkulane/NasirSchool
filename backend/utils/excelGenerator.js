const ExcelJS = require('exceljs');

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const generateExamResultExcel = (results, filters = {}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Exam Results');

  // Process data
  const studentMap = {};
  
  console.log('Raw results count:', results.length);
  console.log('Sample result:', results[0]);
  
  results.forEach(result => {
    // Filter by exam type
    if (filters.exam_type && filters.exam_type !== 'all' && result.exam_type !== filters.exam_type) {
      return;
    }
    
    // Filter by subject
    if (filters.subject && result.subject !== filters.subject) {
      return;
    }
    
    // ✅ FIXED: Better student ID extraction
    const studentId = result.student?._id?.toString() || 
                     result.student?.id?.toString() || 
                     result.studentId?.toString() ||
                     `student_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ FIXED: Better student data extraction
    const studentData = result.student || {};
    
    // ✅ FIXED: Handle all possible student ID formats
    let studentCode = 'Unknown';
    if (studentData.Std_ID) studentCode = studentData.Std_ID;
    else if (studentData.studentCode) studentCode = studentData.studentCode;
    else if (studentData.code) studentCode = studentData.code;
    else if (studentData.id) studentCode = `N${String(studentData.id).slice(-3).padStart(3, '0')}`;
    else if (result.studentCode) studentCode = result.studentCode;
    
    // ✅ FIXED: Handle all possible student name formats
    let studentName = 'Unknown Student';
    if (studentData.Std_Name) studentName = studentData.Std_Name;
    else if (studentData.name) studentName = studentData.name;
    else if (studentData.fullName) studentName = studentData.fullName;
    else if (result.studentName) studentName = result.studentName;

    if (!studentMap[studentId]) {
      studentMap[studentId] = {
        student: studentData,
        studentCode: studentCode,
        studentName: studentName,
        subjects: {},
        subjectTotals: {},
        overallTotal: 0,
        totalPossible: 0,
        examCount: 0
      };
    }

    // Initialize subject if not exists
    const subjectName = result.subject;
    if (!studentMap[studentId].subjects[subjectName]) {
      studentMap[studentId].subjects[subjectName] = {
        monthly_one: 0,
        midTerm: 0,
        monthly_two: 0,
        Final: 0
      };
      studentMap[studentId].subjectTotals[subjectName] = 0;
    }

    // Add marks to subject exam type
    const examType = result.exam_type;
    const marks = parseFloat(result.marks) || 0;
    const maxMarks = parseFloat(result.maxMarks) || 100;

    studentMap[studentId].subjects[subjectName][examType] = marks;
    
    // Update subject total
    if (filters.exam_type && filters.exam_type !== 'all') {
      studentMap[studentId].subjectTotals[subjectName] = marks;
    } else {
      studentMap[studentId].subjectTotals[subjectName] += marks;
    }

    // ✅ FIXED: Use actual max marks for percentage calculation
    studentMap[studentId].overallTotal += marks;
    studentMap[studentId].totalPossible += maxMarks;
    studentMap[studentId].examCount += 1;
  });

  // Convert to array and calculate percentages
  const tableData = Object.values(studentMap)
    .map((student) => {
      // ✅ FIXED: Correct percentage calculation
      const overallPercentage = student.totalPossible > 0 
        ? (student.overallTotal / student.totalPossible) * 100 
        : 0;

      return {
        ...student,
        overallPercentage,
        grade: calculateGrade(overallPercentage)
      };
    })
    .sort((a, b) => b.overallPercentage - a.overallPercentage)
    .map((student, index) => ({
      ...student,
      rank: index + 1
    }));

  // Get all unique subjects
  const allSubjects = [...new Set(results
    .filter(result => {
      if (filters.exam_type && filters.exam_type !== 'all' && result.exam_type !== filters.exam_type) {
        return false;
      }
      if (filters.subject && result.subject !== filters.subject) {
        return false;
      }
      return true;
    })
    .map(result => result.subject)
    .filter(Boolean)
  )].sort();

  console.log('Processed Data Summary:', {
    totalStudents: tableData.length,
    subjects: allSubjects,
    sampleStudent: tableData[0] ? {
      code: tableData[0].studentCode,
      name: tableData[0].studentName,
      totalMarks: tableData[0].overallTotal,
      totalPossible: tableData[0].totalPossible,
      percentage: tableData[0].overallPercentage,
      subjects: Object.keys(tableData[0].subjects)
    } : 'No data'
  });

  // ✅ FIXED: Simple colors - white background and black text
  const colors = {
    background: 'FFFFFFFF',   // White background
    text: 'FF000000',        // Black text
    white: 'FFFFFFFF',       // White
    black: 'FF000000'        // Black
  };

  // Determine headers
  const isAllExamsMode = !filters.exam_type || filters.exam_type === 'all';
  const isSingleSubjectMode = !!filters.subject;

  let headers = ['Rank', 'Student ID', 'Student Name'];

  // Add subject columns
  if (isSingleSubjectMode) {
    if (isAllExamsMode) {
      headers.push('Monthly One', 'Mid Term', 'Monthly Two', 'Final Exam', 'Total');
    } else {
      headers.push('Marks');
    }
  } else {
    allSubjects.forEach(subject => {
      headers.push(subject);
    });
  }

  headers.push('Total Marks', 'Total %', 'Grade');

  // Add headers row
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: colors.text }, size: 11 };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 35;

  // ✅ FIXED: All headers have white background
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.background } };
  });

  // Set column widths
  const columnWidths = [
    { width: 8 },   // Rank
    { width: 15 },  // Student ID
    { width: 25 },  // Student Name
  ];

  if (isSingleSubjectMode) {
    if (isAllExamsMode) {
      columnWidths.push(...Array(5).fill().map(() => ({ width: 12 })));
    } else {
      columnWidths.push({ width: 12 });
    }
  } else {
    columnWidths.push(...allSubjects.map(() => ({ width: 15 })));
  }

  columnWidths.push(
    { width: 12 }, // Total Marks
    { width: 10 }, // Total %
    { width: 8 }   // Grade
  );

  worksheet.columns = columnWidths;

  // Add data rows
  tableData.forEach((student, rowIndex) => {
    const rowData = [
      student.rank,
      student.studentCode,
      student.studentName
    ];

    // Add subject data
    if (isSingleSubjectMode) {
      const subjectData = student.subjects[filters.subject];
      if (isAllExamsMode) {
        rowData.push(
          subjectData?.monthly_one || 0,
          subjectData?.midTerm || 0,
          subjectData?.monthly_two || 0,
          subjectData?.Final || 0,
          student.subjectTotals[filters.subject] || 0
        );
      } else {
        rowData.push(subjectData?.[filters.exam_type] || 0);
      }
    } else {
      allSubjects.forEach(subject => {
        if (isAllExamsMode) {
          rowData.push(student.subjectTotals[subject] || 0);
        } else {
          rowData.push(student.subjects[subject]?.[filters.exam_type] || 0);
        }
      });
    }

    // Add overall data
    rowData.push(
      student.overallTotal,
      student.overallPercentage.toFixed(1),
      student.grade
    );

    const row = worksheet.addRow(rowData);

    // ✅ FIXED: All rows have white background and black text
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.background } };
      cell.font = { color: { argb: colors.text } };
    });

    // Add bold for 1st place rank only
    if (student.rank === 1) {
      row.font = { color: { argb: colors.text }, bold: true };
    }

    row.alignment = { vertical: 'middle' };
    row.height = 25;
    
    // Center align numeric cells
    const numericColumns = [0, ...Array.from({length: headers.length - 3}, (_, i) => 3 + i)];
    numericColumns.forEach(colIndex => {
      row.getCell(colIndex + 1).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Left align student name
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // ✅ FIXED: Black borders
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: colors.text } },
        left: { style: 'thin', color: { argb: colors.text } },
        bottom: { style: 'thin', color: { argb: colors.text } },
        right: { style: 'thin', color: { argb: colors.text } }
      };
    });
  });

  return workbook;
};

// ✅ FIXED: Simple grade styling - all white background
function getGradeColor(grade, colors) {
  return { fill: colors.background, font: colors.text };
}

// ✅ FIXED: Simple percentage styling - all black text
function getPercentageColor(percentage, colors) {
  return colors.text;
}

module.exports = { 
  generateExamResultExcel 
};