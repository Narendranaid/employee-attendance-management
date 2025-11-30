// src/features/auth/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login, register, loadMe } from './authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * Auth component — combined Login / Register
 * - Shows two tabs (Login / Register)
 * - Normalizes server errors to plain text
 * - Shows a small success toast on success, then redirects
 * - After login/register we dispatch loadMe() to ensure user is loaded into store
 */

function formatError(err) {
  if (!err) return 'An unknown error occurred';
  if (typeof err === 'string') {
    // remove common HTML artifacts and collapse whitespace
    return err.replace(/&nbsp;/g, ' ').replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    // Axios common shapes
    if (err.response && err.response.data) {
      const d = err.response.data;
      if (typeof d === 'string') return formatError(d);
      if (d.message) return d.message;
      if (d.error) return d.error;
      return JSON.stringify(d);
    }
    if (err.message) return err.message;
    try { return JSON.stringify(err); } catch (e) { return 'An error occurred'; }
  }
  return String(err);
}

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    role: 'employee',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 1500);
    return () => clearTimeout(t);
  }, [successMsg]);

  const onChangeLogin = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const onChangeReg = (e) => setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const payload = await dispatch(login(loginForm)).unwrap();
      console.debug('LOGIN PAYLOAD:', payload);
      // ensure auth state has latest user data
      try {
        await dispatch(loadMe()).unwrap();
      } catch (ignored) {
        // loadMe may fail if token handling differs; ignore but proceed with payload
        console.debug('loadMe failed after login (non-fatal)', ignored);
      }
      setSuccessMsg('Login successful');
      // navigate after a short delay so user sees toast
      setTimeout(() => {
        const role = payload?.user?.role;
        if (role === 'manager') navigate('/manager', { replace: true });
        else navigate('/dashboard', { replace: true });
      }, 600);
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regForm.name || !regForm.email || !regForm.password || !regForm.employeeId) {
      setErrorMsg('Please provide name, email, password and employeeId.');
      return;
    }

    setLoading(true);
    try {
      const payload = await dispatch(register(regForm)).unwrap();
      console.debug('REGISTER PAYLOAD:', payload);
      try {
        await dispatch(loadMe()).unwrap();
      } catch (ignored) {
        console.debug('loadMe failed after register (non-fatal)', ignored);
      }
      setSuccessMsg('Registration successful');
      setTimeout(() => {
        const role = payload?.user?.role;
        if (role === 'manager') navigate('/manager', { replace: true });
        else navigate('/dashboard', { replace: true });
      }, 600);
    } catch (err) {
      setErrorMsg(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      {/* Success toast */}
      {successMsg && (
        <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 999 }}>
          <div className="px-4 py-2 bg-green-600 text-white rounded shadow">{successMsg}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg max-w-xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h2>
          <div className="space-x-2">
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`px-3 py-1 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`px-3 py-1 rounded ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Register
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
            {errorMsg}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={onChangeLogin}
              required
              className="w-full p-2 border rounded bg-gray-50"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={onChangeLogin}
              required
              className="w-full p-2 border rounded"
            />

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-sm text-gray-500 text-center pt-2">
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('register')} className="text-blue-600 underline">Register</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              name="name"
              placeholder="Full name"
              value={regForm.name}
              onChange={onChangeReg}
              required
              className="w-full p-2 border rounded"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={regForm.email}
              onChange={onChangeReg}
              required
              className="w-full p-2 border rounded bg-gray-50"
            />
            <input
              name="employeeId"
              placeholder="Employee ID (e.g., EMP002)"
              value={regForm.employeeId}
              onChange={onChangeReg}
              required
              className="w-full p-2 border rounded"
            />
            <input
              name="department"
              placeholder="Department (optional)"
              value={regForm.department}
              onChange={onChangeReg}
              className="w-full p-2 border rounded"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={regForm.password}
              onChange={onChangeReg}
              required
              className="w-full p-2 border rounded"
            />

            <div className="text-sm">
              <label className="mr-2">Role:</label>
              <select name="role" value={regForm.role} onChange={onChangeReg} className="p-2 border rounded">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-sm text-gray-500 text-center pt-2">
              Already registered?{' '}
              <button type="button" onClick={() => setMode('login')} className="text-blue-600 underline">Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}