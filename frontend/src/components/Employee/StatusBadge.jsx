import React from 'react';

const colors = {
  present:  "bg-green-100 text-green-700",
  late:     "bg-yellow-100 text-yellow-700",
  "half-day": "bg-orange-100 text-orange-700",
  absent:   "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const cls = colors[status] || colors.absent;

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${cls}`}>
      {status}
    </span>
  );
}