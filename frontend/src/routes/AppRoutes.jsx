// src/routes/AppRoutes.jsx
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import store from '../app/store';
import { loadMe } from '../features/auth/authSlice';

// Auth
import Auth from '../features/auth/Auth';
import Register from '../features/auth/Register';

// Employee pages
import EmployeeDashboard from '../components/Employee/Dashboard';
import MarkAttendance from '../components/Employee/MarkAttendance';
import MyHistory from '../components/Employee/MyHistory';
import Profile from '../components/Employee/Profile';

// ProtectedRoute
import ProtectedRoute from '../components/ProtectedRoute';

// Manager pages — import only one dashboard component
// If you want to use the new ManagerDashboard, import that.
// If you want the existing TeamDashboard, change this import to '../components/Manager/TeamDashboard'
import ManagerDashboard from '../components/Manager/ManagerDashboard';

import AllEmployeesAttendance from '../components/Manager/AllEmployeesAttendance';
import TeamCalendar from '../components/Manager/TeamCalendar';
import Reports from '../components/Manager/Reports';

function AppWrapper() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t && !token) {
      dispatch(loadMe()).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, [dispatch, token]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      {/* Employee + Manager access to general employee pages */}
      <Route element={<ProtectedRoute roles={['employee', 'manager']} />}>
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Employee-only pages */}
      <Route element={<ProtectedRoute roles={['employee']} />}>
        <Route path="/attendance/mark" element={<MarkAttendance />} />
        <Route path="/attendance/history" element={<MyHistory />} />
      </Route>

      {/* Manager-only pages */}
      <Route element={<ProtectedRoute roles={['manager']} />}>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/employees" element={<AllEmployeesAttendance />} />
        <Route path="/manager/calendar" element={<TeamCalendar />} />
        <Route path="/manager/reports" element={<Reports />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </Provider>
  );
}