// src/features/auth/Register.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from './authSlice';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', employeeId: '', department: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload = await dispatch(register(form)).unwrap();
      if (payload?.token) navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || err || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl mb-4">Register</h2>
        {error && <div className="mb-3 text-red-700 bg-red-100 p-2 rounded">{String(error)}</div>}
        <input name="name" value={form.name} onChange={onChange} placeholder="Full name" required className="mb-2 p-2 border w-full rounded" />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" required className="mb-2 p-2 border w-full rounded" />
        <input name="employeeId" value={form.employeeId} onChange={onChange} placeholder="Employee ID (EMP...)" required className="mb-2 p-2 border w-full rounded" />
        <input name="department" value={form.department} onChange={onChange} placeholder="Department" className="mb-2 p-2 border w-full rounded" />
        <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" required className="mb-4 p-2 border w-full rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}