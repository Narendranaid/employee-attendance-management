// src/components/Manager/Reports.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { exportAttendanceCsv } from '../../features/attendance/attendanceSlice';
import BackButton from '../BackButton';
export default function Reports(){
  const dispatch = useDispatch();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleExport = async () => {
    if (!from || !to) return alert('Select from and to dates');
    try {
      const blob = await dispatch(exportAttendanceCsv({ from, to, employeeId })).unwrap();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${from}_${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Export failed: ' + (e?.message || e));
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-4 flex items-center justify-start">
        <BackButton className="bg-white border-gray-200 text-gray-700"/>
       </div>
      <h1 className="text-2xl font-semibold mb-4">Reports</h1>
      <div className="bg-white rounded shadow p-4 space-y-3">
        <div>
          <label className="text-sm">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Employee ID (optional)</label>
          <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP002" className="w-full p-2 border rounded" />
        </div>
        <div>
          <button onClick={handleExport} className="bg-indigo-600 text-white px-4 py-2 rounded">Export CSV</button>
        </div>
      </div>
    </div>
  );
}