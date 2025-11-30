// src/components/Employee/MarkAttendance.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import BackButton from '../../components/BackButton'
export default function MarkAttendance() {
  const [today, setToday] = useState(null);

  const loadToday = async () => {
    const res = await api.get('/attendance/today');
    setToday(res.data);
  };

  useEffect(() => {
    loadToday();
  }, []);

  const checkIn = async () => {
    await api.post('/attendance/checkin');
    await loadToday();
    alert("Checked in!");
  };

  const checkOut = async () => {
    await api.post('/attendance/checkout');
    await loadToday();
    alert("Checked out!");
  };

  const hasCheckedIn = today?.checkInTime ? true : false;
  const hasCheckedOut = today?.checkOutTime ? true : false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex items-center justify-start">
         <BackButton className="bg-white border-gray-200 text-gray-700"/>
       </div>
        <h1 className="text-3xl font-semibold mb-6 text-center">Mark Attendance</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-6 text-center">
          <h2 className="text-gray-500 text-sm">Today's status</h2>

          <div className="text-3xl font-bold mt-2">
            {today?.status || "Not checked in"}
          </div>

          <div className="text-sm text-gray-500 mt-4">
            {today?.checkInTime && (
              <p>Check In: {new Date(today.checkInTime).toLocaleTimeString()}</p>
            )}
            {today?.checkOutTime && (
              <p>Check Out: {new Date(today.checkOutTime).toLocaleTimeString()}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {/* CHECK IN BUTTON */}
          <button
            onClick={checkIn}
            disabled={hasCheckedIn}
            className={`w-40 py-2 rounded text-white 
              ${hasCheckedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            Check In
          </button>

          {/* CHECK OUT BUTTON */}
          <button
            onClick={checkOut}
            disabled={!hasCheckedIn || hasCheckedOut}
            className={`w-40 py-2 rounded text-white
              ${(!hasCheckedIn || hasCheckedOut)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}