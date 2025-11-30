// backend/controllers/attendanceController.js
// Clean, consistent and enhanced attendance controller
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Parser } = require('json2csv');

/**
 * Helper: produce YYYY-MM-DD string
 */
const todayStr = (d = new Date()) => d.toISOString().slice(0, 10);

/**
 * Employee: Check In
 * - prevents double check-in
 * - sets status (late/present) based on a fixed office start time
 */
exports.checkIn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = todayStr();
  let att = await Attendance.findOne({ userId, date });

  if (att && att.checkInTime) {
    res.status(400);
    throw new Error('Already checked in');
  }

  const now = new Date();
  if (!att) att = new Attendance({ userId, date });
  att.checkInTime = now;

  // office start at 09:45:00 local time
  const officeStart = new Date();
  officeStart.setHours(9, 45, 0, 0);

  att.status = now > officeStart ? 'late' : 'present';
  await att.save();

  // populate minimal user info before returning (useful for frontend)
  await att.populate('userId', 'name employeeId department').execPopulate?.();
  const out = att.toObject ? att.toObject() : att;
  res.json(out);
});

/**
 * Employee: Check Out
 */
exports.checkOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = todayStr();

  const att = await Attendance.findOne({ userId, date });
  if (!att || !att.checkInTime) {
    res.status(400);
    throw new Error('No check-in found for today');
  }
  if (att.checkOutTime) {
    res.status(400);
    throw new Error('Already checked out');
  }

  const now = new Date();
  att.checkOutTime = now;

  const hours = (att.checkOutTime - att.checkInTime) / (1000 * 60 * 60);
  att.totalHours = Math.round(hours * 100) / 100;

  if (att.totalHours < 4) att.status = 'half-day';
  else if (att.status === 'late') att.status = 'late';
  else att.status = 'present';

  await att.save();

  await att.populate('userId', 'name employeeId department').execPopulate?.();
  res.json(att);
});

/**
 * My history - returns attendance rows for logged-in user
 * Query params:
 *  - month=YYYY-MM  (optional)
 *  - limit (optional)
 */
exports.myHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { month, limit = 100 } = req.query;
  const match = { userId };
  if (month) match.date = { $regex: `^${month}` };

  const records = await Attendance.find(match)
    .sort({ date: -1 })
    .limit(parseInt(limit, 10))
    .lean();

  res.json(records);
});

/**
 * My monthly summary
 * Returns month, summary counts and rows for the month
 */
exports.mySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const rows = await Attendance.find({ userId, date: { $regex: `^${month}` } }).lean();

  const summary = rows.reduce((acc, r) => {
    acc.total = (acc.total || 0) + 1;
    acc[r.status] = (acc[r.status] || 0) + 1;
    acc.totalHours = (acc.totalHours || 0) + (r.totalHours || 0);
    return acc;
  }, {});

  res.json({ month, summary, rows });
});

/**
 * Today's status for employee
 */
exports.today = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = todayStr();

  const att = await Attendance.findOne({ userId, date }).lean();
  if (!att) return res.json({ date, status: 'absent' });
  res.json(att);
});

/**
 * Manager: get all attendance (with filters/pagination)
 * Query params supported: page, limit, employeeId, date, status, department
 *
 * Notes:
 *  - returns .data array of attendance rows where each row has userId populated
 */
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, employeeId, date, status, department } = req.query;
  const q = {};

  if (date) q.date = date;
  if (status) q.status = status;

  if (employeeId) {
    const user = await User.findOne({ employeeId }).select('_id').lean();
    q.userId = user ? user._id : null;
  }

  if (department) {
    const users = await User.find({ department }).select('_id').lean();
    q.userId = { $in: users.map(u => u._id) };
  }

  const docs = await Attendance.find(q)
    .sort({ date: -1 })
    .limit(parseInt(limit, 10))
    .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
    .populate('userId', 'name employeeId department')
    .lean();

  res.json({ page: parseInt(page, 10), limit: parseInt(limit, 10), data: docs });
});

/**
 * Manager: get attendance by employee id (user _id)
 */
exports.getByEmployee = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // accept either ObjectId or employeeId string (flexible)
  let queryUserId = userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const u = await User.findOne({ employeeId: userId }).select('_id').lean();
    if (!u) return res.json([]);
    queryUserId = u._id;
  }

  const docs = await Attendance.find({ userId: queryUserId })
    .sort({ date: -1 })
    .limit(500)
    .populate('userId', 'name employeeId department')
    .lean();

  res.json(docs);
});

/**
 * Manager: export CSV (filtered by date range / employeeId)
 * Query params: from=YYYY-MM-DD, to=YYYY-MM-DD, employeeId
 */
exports.exportCsv = asyncHandler(async (req, res) => {
  const { from, to, employeeId } = req.query;
  const q = {};

  if (from && to) q.date = { $gte: from, $lte: to };

  if (employeeId) {
    const user = await User.findOne({ employeeId }).select('_id').lean();
    q.userId = user ? user._id : null;
  }

  const rows = await Attendance.find(q).populate('userId', 'name employeeId department').lean();

  const data = rows.map(r => ({
    employeeId: r.userId?.employeeId || '',
    name: r.userId?.name || '',
    department: r.userId?.department || '',
    date: r.date,
    checkInTime: r.checkInTime ? new Date(r.checkInTime).toISOString() : '',
    checkOutTime: r.checkOutTime ? new Date(r.checkOutTime).toISOString() : '',
    status: r.status,
    totalHours: r.totalHours || 0
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment(`attendance_${Date.now()}.csv`);
  res.send(csv);
});

/**
 * Manager summary
 * Returns:
 *  - totals: totalEmployees, presentToday, absentToday, lateToday
 *  - trend: last 7 days present/absent/late
 *  - dept: [{ name, value }]
 *  - absentList: [{ name, employeeId, department }]
 *  - perDay: { 'YYYY-MM-DD': { present, late, absent } } for the requested month
 */
exports.getTeamSummary = asyncHandler(async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
  const today = new Date().toISOString().slice(0, 10);

  // totals
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const presentCount = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'half-day'] } });
  const lateCount = await Attendance.countDocuments({ date: today, status: 'late' });
  const absentCount = await Attendance.countDocuments({ date: today, status: 'absent' });

  // absent list populated
  const absentRows = await Attendance.find({ date: today, status: 'absent' })
    .populate('userId', 'name employeeId department')
    .lean();
  const absentList = absentRows.map(r => ({
    name: r.userId?.name || '',
    employeeId: r.userId?.employeeId || '',
    department: r.userId?.department || ''
  }));

  // last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const trendAgg = await Attendance.aggregate([
    { $match: { date: { $in: days } } },
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'half-day']] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const trend = days.map(day => {
    const found = trendAgg.find(t => t._id === day);
    return { label: day.slice(5), present: found ? found.present : 0, absent: found ? found.absent : 0, late: found ? found.late : 0 };
  });

  // department distribution
  const deptAgg = await User.aggregate([
    { $match: { role: 'employee' } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } }
  ]);

  // per-day summary for month
  const perDayAgg = await Attendance.aggregate([
    { $match: { date: { $regex: `^${month}` } } },
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'half-day']] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const perDay = {};
  perDayAgg.forEach(p => {
    perDay[p._id] = { present: p.present, late: p.late, absent: p.absent };
  });

  res.json({
    totals: {
      totalEmployees,
      presentToday: presentCount,
      absentToday: absentCount,
      lateToday: lateCount
    },
    trend,
    dept: deptAgg,
    absentList,
    perDay
  });
});