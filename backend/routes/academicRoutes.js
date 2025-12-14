// routes/academicRoutes.js
const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// Academic Year Routes
router.get('/years', academicController.getAcademicYears);
router.post('/years', academicController.createAcademicYear);
router.put('/years/:id/activate', academicController.setActiveAcademicYear);
router.put('/years/:id/complete', academicController.completeAcademicYear);

// Student Academic History
router.get('/students/history', academicController.getStudentsByAcademicYear);
router.get('/students/:studentId/history', academicController.getStudentAcademicHistory);
router.get('/students/history/export', academicController.exportAcademicHistories); // Add this
// Add this to academicRoutes.js
router.post('/populate-base-year', academicController.populateBaseAcademicYear);

// Transfer Operations
router.post('/transfer/individual', academicController.transferStudents);
router.post('/transfer/bulk', academicController.bulkTransferClass);
router.post('/initialize', academicController.initializeAcademicYear);

module.exports = router;