// src/components/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * BackButton
 * props:
 *  - to: optional string path to navigate to instead of history.back()
 *  - className: optional tailwind classes to customize
 *  - children: optional label text (default "Back")
 */
export default function BackButton({ to, className = '', children = 'Back' }) {
  const navigate = useNavigate();

  const handle = (e) => {
    e.preventDefault();
    if (to) navigate(to, { replace: true });
    else navigate(-1);
  };

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium border hover:shadow-sm focus:outline-none ${className}`}
      aria-label="Go back"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>{children}</span>
    </button>
  );
}
