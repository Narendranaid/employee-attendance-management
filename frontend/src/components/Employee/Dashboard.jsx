// src/components/Employee/Dashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary, getToday } from '../../features/attendance/attendanceSlice';
import CalendarView from './CalendarView';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-semibold mt-2">{value}</div>
  </div>
);

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, history, today } = useSelector(s => s.attendance);
  const authUser = useSelector(s => s.auth.user);

  useEffect(() => {
    const month = new Date().toISOString().slice(0,7);
    dispatch(getToday());
    dispatch(getMySummary({ month }));
    dispatch(getMyHistory({ limit: 7 }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {authUser?.name || 'Employee'}</h1>
          <div className="text-sm text-gray-500">Employee ID: {authUser?.employeeId}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/attendance/mark')} className="bg-green-600 text-white px-3 py-1 rounded">Mark Attendance</button>
          <button onClick={() => navigate('/attendance/history')} className="bg-white border px-3 py-1 rounded">My History</button>
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's status" value={today?.status || 'Not Checked In'} />
        <StatCard title="Present this month" value={summary?.summary?.present || 0} />
        <StatCard title="Absent this month" value={summary?.summary?.absent || 0} />
        <StatCard title="Total hours this month" value={summary?.summary?.totalHours ? Number(summary.summary.totalHours).toFixed(2) : '0.00'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium mb-2">Recent Attendance</h2>
          {/* reuse table from earlier */}
          <div className="bg-white rounded shadow p-4">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-500 border-b">
                <tr><th className="py-2">Date</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th></tr>
              </thead>
              <tbody>
                {history && history.length ? history.map(r => (
                  <tr key={r._id} className="border-b even:bg-gray-50">
                    <td className="py-2">{r.date}</td>
                    <td>{r.status}</td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-'}</td>
                    <td>{r.totalHours || 0}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="py-6 text-center text-gray-500">No records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">Calendar</h2>
          <CalendarView />
        </div>
      </div>
    </div>
  );
}