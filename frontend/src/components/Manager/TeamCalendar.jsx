// src/components/Manager/TeamCalendar.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import dayjs from 'dayjs';
import BackButton from '../BackButton';
/**
 * TeamCalendar
 * - centers itself
 * - shows month navigation
 * - displays P: A: L: counts for each day (colors)
 * - highlights selected day
 *
 * expects backend GET /api/attendance/summary?month=YYYY-MM returning perDay map
 */

const WeekDays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

export default function TeamCalendar({ initialMonth }) {
  const today = dayjs();
  const [month, setMonth] = useState(initialMonth ? dayjs(initialMonth + '-01') : today);
  const [perDay, setPerDay] = useState({}); // { 'YYYY-MM-DD': { present, absent, late } }
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummaryForMonth();
    // eslint-disable-next-line
  }, [month]);

  const loadSummaryForMonth = async () => {
    setLoading(true);
    try {
      const m = month.format('YYYY-MM');
      const res = await api.get('/attendance/summary', { params: { month: m } });
      setPerDay(res.data.perDay || {});
    } catch (err) {
      console.error('loadSummaryForMonth', err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setMonth(month.subtract(1, 'month'));
  const nextMonth = () => setMonth(month.add(1, 'month'));

  // build the month grid
  const startOfMonth = month.startOf('month');
  // week starts MON — compute offset (day() Sunday=0)
  const firstWeekday = (startOfMonth.day() + 6) % 7; // convert Sunday=0 to index where Mon=0
  const daysInMonth = month.daysInMonth();

  // create an array representing the calendar cells
  const cells = [];
  // leading blanks
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // trailing blanks to fill 7-column grid
  while (cells.length % 7 !== 0) cells.push(null);

  const renderCounts = (dateStr) => {
    const data = perDay[dateStr] || { present: 0, absent: 0, late: 0 };
    // only display counts if any > 0
    return (
      <div className="text-xs mt-1 leading-tight text-left">
        <div className="text-green-600">P: {data.present}</div>
        <div className="text-red-600">A: {data.absent}</div>
        <div className="text-yellow-600">L: {data.late}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-start">
         <BackButton className="bg-white border-gray-200 text-gray-700"/>
       </div>
        <h2 className="text-2xl font-semibold mb-4">Team Calendar</h2>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">‹</button>
              <button onClick={() => setMonth(dayjs())} className="px-2 py-1 rounded hover:bg-gray-100">Today</button>
              <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">›</button>
            </div>
            <div className="text-lg font-medium">{month.format('MMMM YYYY')}</div>
            <div className="text-sm text-gray-500">{loading ? 'Loading...' : ''}</div>
          </div>

          <div className="border rounded p-3">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-600 mb-2">
              {WeekDays.map(w => <div key={w} className="text-center">{w}</div>)}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {cells.map((cell, i) => {
                if (cell === null) {
                  return <div key={i} className="h-28 border rounded bg-gray-50" />;
                }
                const dateObj = month.date(cell);
                const iso = dateObj.format('YYYY-MM-DD');
                const isSelected = selected === iso;
                const isToday = dateObj.isSame(dayjs(), 'day');

                return (
                  <div
                    key={iso}
                    onClick={() => setSelected(iso)}
                    className={`h-28 border rounded p-2 cursor-pointer ${isSelected ? 'ring-2 ring-indigo-300' : ''} ${isToday ? 'bg-yellow-50' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">{cell}</div>
                      <div className="text-xs text-gray-400">{dateObj.format('ddd')}</div>
                    </div>

                    {/* counts */}
                    {renderCounts(iso)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* selected date details */}
        {selected && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Details for {dayjs(selected).format('DD MMM YYYY')}</div>
            <div className="mt-2">
              <pre className="text-sm">{JSON.stringify(perDay[selected] || {}, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}