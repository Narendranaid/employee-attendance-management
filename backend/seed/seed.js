// backend/seed/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// helper utils
const hrsBetween = (inDate, outDate) => {
  const diffMs = Math.max(0, new Date(outDate) - new Date(inDate));
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
};
const makeIsoDate = (d) => d.toISOString().slice(0, 10);
const atTime = (baseDate, hours, minutes = 0) => {
  const dt = new Date(baseDate);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
};

const seed = async () => {
  await connectDB();
  console.log('Connected to DB');

  // Clear small subset data (careful in prod)
  // await User.deleteMany({}); // optional - use during dev only
  // await Attendance.deleteMany({});

  // Create manager (upsert)
  const managerData = {
    name: 'Alice Manager',
    email: 'alice.manager@example.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'EMP001',
    department: 'HR'
  };
  await User.updateOne({ employeeId: managerData.employeeId }, { $set: managerData }, { upsert: true });

  // Departments
  const departments = ['Engineering', 'Sales', 'Support'];

  // Create 20 employees
  const employees = [];
  for (let i = 2; i <= 21; i++) {
    const empId = `EMP${String(i).padStart(3, '0')}`;
    const user = {
      name: `Employee ${i}`,
      email: `employee${i}@example.com`,
      password: 'password123',
      role: 'employee',
      employeeId: empId,
      department: departments[i % departments.length]
    };
    await User.updateOne({ employeeId: empId }, { $set: user }, { upsert: true });
    const u = await User.findOne({ employeeId: empId }).lean();
    employees.push(u);
  }
  console.log(`Seeded ${employees.length} employees`);

  // Create attendance for last 15 days
  const today = new Date();
  const daysToSeed = 15;

  for (let d = 1; d <= daysToSeed; d++) {
    const day = new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
    const dateStr = makeIsoDate(day);

    for (const emp of employees) {
      // Randomize status
      const r = Math.random();
      let status = 'present';
      let checkIn = atTime(day, 9, 10);
      let checkOut = atTime(day, 18, 0);

      if (r < 0.08) { // 8% absent
        status = 'absent';
        checkIn = null;
        checkOut = null;
      } else if (r < 0.18) { // 10% half-day
        status = 'half-day';
        checkIn = atTime(day, 10, 0);
        checkOut = atTime(day, 15, 0);
      } else if (r < 0.30) { // 12% late
        status = 'late';
        checkIn = atTime(day, 10 + Math.floor(Math.random()*3), 10 + Math.floor(Math.random()*40));
        checkOut = atTime(day, 18, 0);
      } else {
        // present normal with small variation
        const addMin = Math.floor(Math.random() * 20) - 10; // -10..9
        checkIn = atTime(day, 9, 10 + addMin);
        checkOut = atTime(day, 18, 0);
      }

      const totalHours = (checkIn && checkOut) ? hrsBetween(checkIn, checkOut) : 0;

      // upsert to avoid duplicate-key errors
      await Attendance.updateOne(
        { userId: emp._id, date: dateStr },
        {
          $set: {
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status,
            totalHours,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    }
  }

  console.log('Attendance seeded for last', daysToSeed, 'days');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});