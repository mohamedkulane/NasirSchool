// src/components/Admin/Expenses.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Download, Calendar, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    item: ''
  });

  const [formData, setFormData] = useState({
    E_item: '',
    E_amount: '',
    E_date: new Date().toISOString().split('T')[0],
    E_description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getExpenses(filters);
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await adminAPI.updateExpense(editingExpense._id, formData);
      } else {
        await adminAPI.createExpense(formData);
      }
      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        E_item: '',
        E_amount: '',
        E_date: new Date().toISOString().split('T')[0],
        E_description: ''
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      E_item: expense.E_item,
      E_amount: expense.E_amount,
      E_date: new Date(expense.E_date).toISOString().split('T')[0],
      E_description: expense.E_description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await adminAPI.deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const exportExpenses = async () => {
    setExportLoading(true);
    try {
      const response = await adminAPI.exportExpenses(filters);
      
      // Check if response has data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp and filters
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = `expenses_${timestamp}`;
      
      if (filters.startDate && filters.endDate) {
        filename += `_${filters.startDate}_to_${filters.endDate}`;
      } else if (filters.startDate) {
        filename += `_from_${filters.startDate}`;
      } else if (filters.endDate) {
        filename += `_until_${filters.endDate}`;
      }
      
      filename += '.xlsx';
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Expenses exported successfully!');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      
      // Handle different types of errors
      if (error.response?.status === 404) {
        alert('Export feature is not available. Please contact administrator.');
      } else if (error.response?.status === 500) {
        alert('Server error occurred during export. Please try again later.');
      } else if (error.message.includes('Network Error')) {
        alert('Network error. Please check your internet connection.');
      } else if (error.message.includes('No data received')) {
        alert('No data available for export. Please check your filters.');
      } else {
        alert('Failed to export expenses. Please try again.');
      }
    } finally {
      setExportLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.E_amount, 0);
  const thisMonthAmount = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.E_date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + expense.E_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="animate-slide-down">
            <h1 className="text-3xl font-bold mb-2">Expenses Management</h1>
            <p className="text-[#FFD93D]">Manage school expenses and budgets</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0 animate-slide-up">
            <button
              onClick={exportExpenses}
              disabled={exportLoading || expenses.length === 0}
              className="flex items-center px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </>
              )}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-[#FFD93D] text-[#4F200D] rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-[#4F200D] to-[#4F200D]/90 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#FFD93D] text-sm">Total Expenses</p>
              <p className="text-2xl font-bold mt-1">${totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-7 w-7 text-[#FFD93D] animate-pulse" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] rounded-2xl p-5 text-[#4F200D] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#4F200D]/90 text-sm">This Month</p>
              <p className="text-2xl font-bold mt-1">${thisMonthAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-7 w-7 text-[#4F200D] animate-bounce" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#FF9A00]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#4F200D] text-sm font-medium">Average/Month</p>
              <p className="text-2xl font-bold mt-1 text-[#4F200D]">
                ${((totalAmount / 12) || 0).toLocaleString()}
              </p>
            </div>
            <PieChart className="h-7 w-7 text-[#FF9A00]" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#FF9A00]/20 p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="h-4 w-4 text-[#4F200D] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expense items..."
                value={filters.item}
                onChange={(e) => setFilters({ ...filters, item: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300"
              />
            </div>
          </div>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#FF9A00]/20 overflow-hidden transition-all duration-300">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9A00]"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <DollarSign className="h-12 w-12 text-[#4F200D]/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#4F200D] mb-1">No Expenses Found</h3>
            <p className="text-[#4F200D]/60">No expenses match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#4F200D] to-[#FF9A00]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF9A00]/20">
                {expenses.map((expense, index) => (
                  <tr 
                    key={expense._id} 
                    className="hover:bg-[#F6F1E9]/50 transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[#4F200D]" />
                        <span className="text-[#4F200D] font-medium">
                          {new Date(expense.E_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#4F200D] group-hover:text-[#FF9A00] transition-colors">
                        {expense.E_item}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#FFD93D]/30 to-[#FF9A00]/30 text-[#4F200D] rounded-lg font-bold text-sm border border-[#FF9A00]/30">
                        ${expense.E_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#4F200D]/80">
                        {expense.E_description || 'No description'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A00]/20 text-[#4F200D] rounded-lg hover:from-[#FFD93D]/30 hover:to-[#FF9A00]/30 hover:scale-110 transition-all duration-300 border border-[#FF9A00]/30"
                          title="Edit Expense"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 bg-gradient-to-r from-[#4F200D]/10 to-[#4F200D]/5 text-[#4F200D] rounded-lg hover:from-[#4F200D]/20 hover:to-[#4F200D]/10 hover:scale-110 transition-all duration-300 border border-[#4F200D]/20"
                          title="Delete Expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-[#FF9A00]/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#4F200D]">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                    setFormData({
                      E_item: '',
                      E_amount: '',
                      E_date: new Date().toISOString().split('T')[0],
                      E_description: ''
                    });
                  }}
                  className="p-1.5 text-[#4F200D] hover:bg-[#F6F1E9] rounded-lg transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4F200D] mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.E_item}
                    onChange={(e) => setFormData({ ...formData, E_item: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4F200D] mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.E_amount}
                    onChange={(e) => setFormData({ ...formData, E_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4F200D] mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.E_date}
                    onChange={(e) => setFormData({ ...formData, E_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4F200D] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.E_description}
                    onChange={(e) => setFormData({ ...formData, E_description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 bg-[#F6F1E9] border border-[#FF9A00]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9A00] focus:border-transparent text-[#4F200D] placeholder-[#4F200D]/60 transition-all duration-300 resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#FF9A00]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingExpense(null);
                      setFormData({
                        E_item: '',
                        E_amount: '',
                        E_date: new Date().toISOString().split('T')[0],
                        E_description: ''
                      });
                    }}
                    className="px-4 py-2 text-[#4F200D] border border-[#FF9A00]/30 rounded-xl hover:bg-[#F6F1E9] transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#FF9A00] to-[#FFD93D] text-[#4F200D] rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;