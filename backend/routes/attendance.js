const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const role = require('../middleware/role');   // <----- FIXED HERE
const ctrl = require('../controllers/attendanceController');

// Employee
router.post('/checkin', protect, ctrl.checkIn);
router.post('/checkout', protect, ctrl.checkOut);
router.get('/my-history', protect, ctrl.myHistory);
router.get('/my-summary', protect, ctrl.mySummary);
router.get('/today', protect, ctrl.today);
router.get('/summary', protect, role('manager'), ctrl.getTeamSummary);
// Manager
router.get('/all', protect, role('manager'), ctrl.getAll);
router.get('/employee/:id', protect, role('manager'), ctrl.getByEmployee);
router.get('/export', protect, role('manager'), ctrl.exportCsv);
router.get('/today-status', protect, role('manager'), async (req, res) => {
  const Attendance = require('../models/Attendance');
  const date = new Date().toISOString().slice(0,10);
  const rows = await Attendance.find({
    date,
    status: { $in: ['present','late','half-day'] }
  })
  .populate('userId','name employeeId department')
  .lean();

  res.json(rows);
});

module.exports = router;