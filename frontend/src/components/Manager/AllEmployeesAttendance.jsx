// src/components/Manager/AllEmployeesAttendance.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllEmployeesAttendance } from '../../features/attendance/attendanceSlice';
import BackButton from '../BackButton';
export default function AllEmployeesAttendance(){
  const dispatch = useDispatch();
  const { all } = useSelector(s => s.attendance);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(getAllEmployeesAttendance({ page, limit, ...filters }));
  }, [dispatch, page, limit, filters]);

  const handleFilter = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const f = {};
    for (let [k,v] of form.entries()) if (v) f[k]=v;
    setFilters(f);
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="mb-4 flex items-center justify-start">
         <BackButton className="bg-white border-gray-200 text-gray-700"/>
       </div>
        <h1 className="text-2xl font-semibold">All Employees Attendance</h1>
      </div>

      <form onSubmit={handleFilter} className="mb-4 flex gap-2 items-end">
        <div>
          <label className="text-sm">EmployeeId</label>
          <input name="employeeId" className="p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Date (YYYY-MM-DD)</label>
          <input name="date" className="p-2 border rounded" placeholder="2025-11-30" />
        </div>
        <div>
          <label className="text-sm">Status</label>
          <select name="status" className="p-2 border rounded">
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half-day">Half-day</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <div>
          <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">Filter</button>
        </div>
      </form>

      <div className="bg-white rounded shadow p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs text-gray-500 border-b">
            <tr><th>Date</th><th>Name</th><th>EmpId</th><th>Dept</th><th>Status</th><th>In</th><th>Out</th></tr>
          </thead>
          <tbody>
            {(all?.data || []).map(r => (
              <tr key={r._id} className="border-b even:bg-gray-50">
                <td className="py-2">{r.date}</td>
                <td>{r.userId?.name}</td>
                <td>{r.userId?.employeeId}</td>
                <td>{r.userId?.department}</td>
                <td>{r.status}</td>
                <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</td>
                <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-3">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
        <div>Page {all?.page ?? page}</div>
        <button disabled={!all?.data || all.data.length < limit} onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}