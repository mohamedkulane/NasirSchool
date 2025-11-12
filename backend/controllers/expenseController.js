const Expense = require('../models/Expense');

// Create New Expense
exports.createExpense = async (req, res) => {
  try {
    const { E_item, E_amount, E_date, E_description } = req.body;

    // Validation
    if (!E_item || !E_amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Expense item and amount are required' 
      });
    }

    if (E_amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Expense amount must be greater than 0' 
      });
    }

    const expense = new Expense({
      E_item,
      E_amount,
      E_date: E_date || new Date(),
      E_description: E_description || ''
    });

    await expense.save();

    res.status(201).json({ 
      success: true, 
      message: 'Expense created successfully',
      data: expense 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get All Expenses with Filtering
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, item, minAmount, maxAmount, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.E_date = {};
      if (startDate) filter.E_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.E_date.$lte = end;
      }
    }
    
    // Item filter (case-insensitive search)
    if (item) {
      filter.E_item = { $regex: item, $options: 'i' };
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.E_amount = {};
      if (minAmount) filter.E_amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.E_amount.$lte = parseFloat(maxAmount);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get expenses with pagination
    const expenses = await Expense.find(filter)
      .sort({ E_date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(totalExpenses / limitNum);

    // Get total amount for the filtered results
    const totalAmountResult = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAmount: { $sum: '$E_amount' } } }
    ]);
    
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    res.json({
      success: true,
      data: expenses,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalExpenses,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      summary: {
        totalAmount,
        averageAmount: totalExpenses > 0 ? (totalAmount / totalExpenses).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        error: 'Expense not found' 
      });
    }

    res.json({ 
      success: true, 
      data: expense 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { E_item, E_amount, E_date, E_description } = req.body;

    // Validation
    if (E_amount && E_amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Expense amount must be greater than 0' 
      });
    }

    const updateData = {};
    if (E_item) updateData.E_item = E_item;
    if (E_amount) updateData.E_amount = E_amount;
    if (E_date) updateData.E_date = E_date;
    if (E_description !== undefined) updateData.E_description = E_description;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        error: 'Expense not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Expense updated successfully',
      data: expense 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        error: 'Expense not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Expense Statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // month, week, year
    
    let groupFormat, dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { E_date: { $gte: weekAgo } };
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$E_date" } };
        break;
      
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        dateFilter = { E_date: { $gte: yearAgo } };
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$E_date" } };
        break;
      
      case 'month':
      default:
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { E_date: { $gte: monthAgo } };
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$E_date" } };
        break;
    }

    // Daily/Monthly expense totals
    const expenseTrends = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          totalAmount: { $sum: "$E_amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top expense items
    const topExpenseItems = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$E_item",
          totalAmount: { $sum: "$E_amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    // Total statistics
    const totalStats = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$E_amount" },
          averageAmount: { $avg: "$E_amount" },
          minAmount: { $min: "$E_amount" },
          maxAmount: { $max: "$E_amount" },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const stats = totalStats.length > 0 ? totalStats[0] : {
      totalAmount: 0,
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0,
      totalCount: 0
    };

    res.json({
      success: true,
      data: {
        trends: expenseTrends,
        topItems: topExpenseItems,
        summary: {
          totalAmount: stats.totalAmount,
          averageAmount: parseFloat(stats.averageAmount?.toFixed(2) || 0),
          minAmount: stats.minAmount,
          maxAmount: stats.maxAmount,
          totalExpenses: stats.totalCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Export Expenses to Excel
exports.exportExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ExcelJS = require('exceljs');
    
    let filter = {};
    
    if (startDate || endDate) {
      filter.E_date = {};
      if (startDate) filter.E_date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.E_date.$lte = end;
      }
    }

    const expenses = await Expense.find(filter).sort({ E_date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');
    
    // Add columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Item', key: 'item', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Add data rows
    expenses.forEach(expense => {
      worksheet.addRow({
        date: expense.E_date.toLocaleDateString(),
        item: expense.E_item,
        amount: expense.E_amount,
        description: expense.E_description,
        createdAt: expense.createdAt.toLocaleString()
      });
    });

    // Add summary row
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.E_amount, 0);
    worksheet.addRow([]);
    worksheet.addRow({
      date: 'TOTAL',
      item: '',
      amount: totalAmount,
      description: '',
      createdAt: ''
    });

    // Style the summary row
    const lastRow = worksheet.lastRow;
    lastRow.font = { bold: true };
    lastRow.getCell('amount').numFmt = '#,##0.00';

    // Format amount column
    worksheet.getColumn('amount').numFmt = '#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get Dashboard Expense Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Today's expenses
    const todayExpenses = await Expense.aggregate([
      {
        $match: {
          E_date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$E_amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // This month's expenses
    const monthExpenses = await Expense.aggregate([
      {
        $match: {
          E_date: { $gte: thisMonthStart, $lt: nextMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$E_amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent expenses (last 5)
    const recentExpenses = await Expense.find()
      .sort({ E_date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        today: {
          total: todayExpenses[0]?.total || 0,
          count: todayExpenses[0]?.count || 0
        },
        month: {
          total: monthExpenses[0]?.total || 0,
          count: monthExpenses[0]?.count || 0
        },
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};