// src/components/Employee/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../utils/api';
import { loadMe } from '../../features/auth/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);

  const [form, setForm] = useState({ name: '', department: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (authUser) {
      setForm({
        name: authUser.name || '',
        department: authUser.department || '',
        password: ''
      });
    }
  }, [authUser]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    try {
      // Build patch object
      const patch = { name: form.name, department: form.department };
      if (form.password && form.password.trim().length > 0) {
        patch.password = form.password;
      }

      // send update to backend (assumes backend accepts PATCH /auth/me)
      // If your backend expects a different endpoint, change this accordingly.
      await api.patch('/auth/me', patch);

      // refresh user in redux store
      try { await dispatch(loadMe()).unwrap(); } catch (e) { /* non-fatal */ }

      setMsg('Profile updated successfully');
      // clear password field
      setForm(prev => ({ ...prev, password: '' }));
    } catch (error) {
      // error may be string or object from api interceptor
      const message = typeof error === 'string' ? error : (error?.message || 'Update failed');
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Profile</h1>

      {msg && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{msg}</div>}
      {err && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>}

      <form onSubmit={onSubmit} className="bg-white rounded shadow p-4 space-y-3">
        <div>
          <label className="text-sm block mb-1">Email (read-only)</label>
          <div className="p-2 border rounded bg-gray-50">{authUser?.email || '—'}</div>
        </div>

        <div>
          <label className="text-sm block mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={onChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">New password (leave empty to keep)</label>
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            className="w-full p-2 border rounded"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}