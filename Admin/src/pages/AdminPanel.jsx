import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';
import Dashboard from '../components/Admin/Dashboard';
import Students from '../components/Admin/Students';
import Teachers from '../components/Admin/Teachers';
import Expenses from '../components/Admin/Expenses';
import ExamResults from '../components/Admin/ExamResults';
import Attendance from '../components/Admin/Attendance';
import Reports from '../components/Admin/Reports';
import AcademicTransfer from '../components/Admin/AcademicTransfer'
import StudentAcademicHistory from '../components/Admin/StudentAcademicHistory'

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-montserrat overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
              <div className="p-6 lg:p-8">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="exam-results" element={<ExamResults />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="academic-transfer" element={<AcademicTransfer />} />
              <Route path="academic-history" element={<StudentAcademicHistory />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;