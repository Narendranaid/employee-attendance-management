// src/components/Employee/MyHistory.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CalendarView from './CalendarView';
import { getMyHistory } from '../../features/attendance/attendanceSlice';
import BackButton from '../BackButton';
import StatusBadge from './StatusBadge';
export default function MyHistory() {
  const dispatch = useDispatch();
  const { history } = useSelector(s => s.attendance);
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM

  useEffect(() => {
    dispatch(getMyHistory({ month, limit: 1000 }));
  }, [dispatch, month]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <BackButton className="bg-white border-gray-200 text-gray-700"/>
        <h1 className="text-2xl font-semibold">My Attendance History</h1>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border p-2 rounded">
          {/* simple last-6-months selector */}
          {Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.toISOString().slice(0,7);
            return <option key={m} value={m}>{m}</option>;
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CalendarView month={month} />
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-medium mb-2">List view ({history?.length || 0})</h2>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-500 border-b">
                <tr><th className="py-2">Date</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th></tr>
              </thead>
              <tbody>
                {history && history.length ? history.map(r => (
                  <tr key={r._id} className="border-b even:bg-gray-50">
                    <td className="py-2">{r.date}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-'}</td>
                    <td>{r.totalHours || 0}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="py-6 text-center text-gray-500">No records</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}