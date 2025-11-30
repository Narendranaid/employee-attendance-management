// frontend/src/components/Employee/CalendarView.jsx
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../../utils/api';

const statusColors = {
  present: { bg: '#008000', text: '#065f46', short: 'P' },
  late:    { bg: '#FFFF00', text: '#92400e', short: 'L' },
  'half-day': { bg: '#FFA500', text: '#9a3412', short: 'H' },
  absent:  { bg: '#FF0000', text: '#991b1b', short: 'A' },
};

export default function CalendarView({ month }) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(false);
  const tgtMonth = month || new Date().toISOString().slice(0,7);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/attendance/my-history', { params: { month: tgtMonth, limit: 1000 }});
        if (!mounted) return;
        const rows = res.data || [];
        const m = {};
        rows.forEach(r => { m[r.date] = r; });
        setMap(m);
      } catch (e) {
        console.error('Calendar load', e);
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [tgtMonth]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key = date.toISOString().slice(0,10);
    const info = map[key];
    if (!info) return null;
    const cfg = statusColors[info.status] || statusColors.absent;
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop: 4 }}>
        <div style={{ width: 26, height: 10, borderRadius: 6, background: cfg.bg, border: `1px solid ${cfg.text}` }} />
        <div style={{ fontSize: 10, color: cfg.text, marginTop: 2 }}>{cfg.short}</div>
      </div>
    );
  };

  const onClickDay = (date) => {
    const key = date.toISOString().slice(0,10);
    const info = map[key];
    if (!info) return alert(`${key}\nStatus: absent`);
    const inT = info.checkInTime ? new Date(info.checkInTime).toLocaleTimeString() : '-';
    const outT = info.checkOutTime ? new Date(info.checkOutTime).toLocaleTimeString() : '-';
    alert(`${key}\nStatus: ${info.status}\nCheck In: ${inT}\nCheck Out: ${outT}\nHours: ${info.totalHours || 0}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-medium">Attendance Calendar ({tgtMonth})</h3>
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
      </div>
      <Calendar onClickDay={onClickDay} tileContent={tileContent} view="month" />
      <div className="mt-3 text-sm">
        <span className="inline-flex items-center mr-3"><span style={{ width:12,height:8,background:statusColors.present.bg, borderRadius:4, display:'inline-block', marginRight:6 }} /> Present</span>
        <span className="inline-flex items-center mr-3"><span style={{ width:12,height:8,background:statusColors.late.bg, borderRadius:4, display:'inline-block', marginRight:6 }} /> Late</span>
        <span className="inline-flex items-center mr-3"><span style={{ width:12,height:8,background:statusColors['half-day'].bg, borderRadius:4, display:'inline-block', marginRight:6 }} /> Half-day</span>
        <span className="inline-flex items-center"><span style={{ width:12,height:8,background:statusColors.absent.bg, borderRadius:4, display:'inline-block', marginRight:6 }} /> Absent</span>
      </div>
    </div>
  );
}