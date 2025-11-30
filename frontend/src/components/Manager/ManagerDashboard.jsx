// src/components/Manager/ManagerDashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamSummary, getTodayStatus, getAllEmployeesAttendance } from '../../features/attendance/attendanceSlice';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';

const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];

export default function ManagerDashboard(){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teamSummary, todayList, all } = useSelector(s => s.attendance);
  const authUser = useSelector(s => s.auth.user);

  useEffect(() => {
    dispatch(getTeamSummary());
    dispatch(getTodayStatus());
    dispatch(getAllEmployeesAttendance({ limit: 10 }));
  }, [dispatch]);

  const trend = (teamSummary && teamSummary.trend) || [];
  const dept = (teamSummary && teamSummary.dept) || [];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome, {authUser?.name}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/manager/employees')} className="bg-white border px-3 py-1 rounded">All Attendance</button>
          <button onClick={() => navigate('/manager/calendar')} className="bg-white border px-3 py-1 rounded">Team Calendar</button>
          <button onClick={() => navigate('/manager/reports')} className="bg-white border px-3 py-1 rounded">Reports</button>
          <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total employees</div>
          <div className="text-2xl font-semibold mt-2">{teamSummary?.totals?.totalEmployees ?? 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Present today</div>
          <div className="text-2xl font-semibold mt-2">{teamSummary?.totals?.presentToday ?? (todayList?.length ?? 0)}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Absent today</div>
          <div className="text-2xl font-semibold mt-2">{teamSummary?.totals?.absentToday ?? 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Late arrivals</div>
          <div className="text-2xl font-semibold mt-2">{teamSummary?.totals?.lateToday ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 lg:col-span-2">
          <h3 className="font-medium mb-2">Weekly Attendance Trend</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#4CAF50" />
                <Bar dataKey="absent" name="Absent" fill="#F44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-2">Department-wise attendance</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={dept} nameKey="name" outerRadius={90} label>
                  {dept.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Absent employees today</h3>
        <div className="bg-white rounded shadow p-4">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b">
              <tr><th>Name</th><th>EmployeeId</th><th>Department</th></tr>
            </thead>
            <tbody>
              {teamSummary?.absentList && teamSummary.absentList.length ? teamSummary.absentList.map(u => (
                <tr key={u.employeeId} className="border-b even:bg-gray-50">
                  <td>{u.name}</td>
                  <td>{u.employeeId}</td>
                  <td>{u.department}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="py-6 text-center text-gray-500">No absent employees today</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Recent attendance (sample)</h3>
        <div className="bg-white rounded shadow p-4">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b">
              <tr><th>Date</th><th>Name</th><th>EmpId</th><th>Status</th><th>In</th><th>Out</th></tr>
            </thead>
            <tbody>
              {(all?.data || []).length ? (all.data).map(r => (
                <tr key={r._id} className="border-b even:bg-gray-50">
                  <td className="py-2">{r.date}</td>
                  <td>{r.userId?.name}</td>
                  <td>{r.userId?.employeeId}</td>
                  <td>{r.status}</td>
                  <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</td>
                  <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-'}</td>
                </tr>
              )) : <tr><td colSpan={6} className="py-6 text-center text-gray-500">No records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}